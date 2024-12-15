import time
import yfinance as yf
import pandas as pd
from scipy.stats import ttest_1samp
import gspread
from gspread_dataframe import set_with_dataframe
from google.oauth2.service_account import Credentials
from gspread_formatting import CellFormat, TextFormat, format_cell_range


class LoadData:
    """
    Fetches historical market data for a given ticker between the specified start and end dates.
    """
    def __init__(self, start_date, end_date, ticker) -> None:
        self._dataframe_stock = None
        self.start_date = start_date
        self.end_date = end_date if end_date else time.strftime('%Y-%m-%d')
        self.ticker = ticker

    @property
    def dataframe_stock(self):
        if self._dataframe_stock is None:
            try:
                self._dataframe_stock = yf.download(self.ticker, start=self.start_date, end=self.end_date, interval='1d')
                if self._dataframe_stock.empty:
                    raise ValueError(f"Ticker '{self.ticker}' is invalid or has no available data.")
                self._dataframe_stock.columns = self._dataframe_stock.columns.get_level_values(0)
            except Exception as e:
                raise ValueError(f"Failed to fetch data for ticker '{self.ticker}': {e}")
        return self._dataframe_stock


class VolumeBreakoutDetect:
    def __init__(self, start_date, end_date, ticker, threshold, service_account_details, email) -> None:
        self.start_date = start_date
        self.end_date = end_date
        self.ticker = ticker
        self.volume_threshold = threshold
        self.service_account_details = service_account_details
        self.email = email
        self._dataframe_stock = None

    @property
    def dataframe_stock(self):
        if self._dataframe_stock is None:
            self._dataframe_stock = LoadData(self.start_date, self.end_date, self.ticker).dataframe_stock
        return self._dataframe_stock

    def _get_median_rolling_data(self):
        dataframe_stock = self.dataframe_stock.copy()
        dataframe_stock['Median Volume'] = dataframe_stock['Volume'].rolling(window=22).median()
        return dataframe_stock

    def generate_google_sheet(self, spreadsheet_name):
        scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
        credentials = Credentials.from_service_account_info(self.service_account_details, scopes=scope)
        client = gspread.authorize(credentials)

        try:
            spreadsheet = client.open(spreadsheet_name)
        except gspread.SpreadsheetNotFound:
            spreadsheet = client.create(spreadsheet_name)
            spreadsheet.share(self.email, perm_type="user", role="writer")

        spreadsheet_url = f"https://docs.google.com/spreadsheets/d/{spreadsheet.id}"
        print(f"Spreadsheet link: {spreadsheet_url}")

        # Prepare worksheets
        worksheet_params = spreadsheet.worksheet("Parameters") if "Parameters" in [
            ws.title for ws in spreadsheet.worksheets()] else spreadsheet.add_worksheet(title="Parameters", rows="100", cols="20")
        worksheet_stats = spreadsheet.worksheet("Average Returns") if "Average Returns" in [
            ws.title for ws in spreadsheet.worksheets()] else spreadsheet.add_worksheet(title="Average Returns", rows="100", cols="20")
        worksheet_breakout = spreadsheet.worksheet("Breakout Days") if "Breakout Days" in [
            ws.title for ws in spreadsheet.worksheets()] else spreadsheet.add_worksheet(title="Breakout Days", rows="100", cols="20")

        worksheet_params.clear()
        worksheet_stats.clear()
        worksheet_breakout.clear()

        # Generate the data
        dataframe_stock = self._get_median_rolling_data()
        dataframe_stock['Volume Breakout'] = dataframe_stock['Volume'] > self.volume_threshold * dataframe_stock['Median Volume']
        dataframe_stock['Daily Return (%)'] = dataframe_stock['Close'].pct_change() * 100

        return_periods = [1, 2, 5, 10, 15, 20, 25, 30]
        for period in return_periods:
            dataframe_stock[f'{period}D Return (%)'] = (
                dataframe_stock['Close'].shift(-period) - dataframe_stock['Close']
            ) / dataframe_stock['Close'] * 100

        breakout_days = dataframe_stock[dataframe_stock['Volume Breakout']].copy()
        breakout_days['Date'] = breakout_days.index.astype(str)
        breakout_days.reset_index(drop=True, inplace=True)

        # Peak Returns Calculation
        peak_returns = []
        for _, breakout in breakout_days.iterrows():
            peak_row = {}
            breakout_index = dataframe_stock.index.get_loc(pd.to_datetime(breakout['Date']))
            for period in return_periods:
                end_index = breakout_index + period
                if end_index > len(dataframe_stock) - 1:
                    peak_row[f'{period}D Peak Return (%)'] = float('nan')
                    continue
                sub_period_returns = [
                    (dataframe_stock['Close'].iloc[breakout_index + i] - dataframe_stock['Close'].iloc[breakout_index])
                    / dataframe_stock['Close'].iloc[breakout_index] * 100
                    for i in range(1, period + 1)
                ]
                peak_row[f'{period}D Peak Return (%)'] = max(sub_period_returns) if sub_period_returns else float('nan')
            peak_returns.append(peak_row)

        peak_returns_df = pd.DataFrame(peak_returns, index=breakout_days.index)
        breakout_days = pd.concat([breakout_days, peak_returns_df], axis=1)

        # Statistics Calculation (Fixing Max Drawdown)
        def calculate_stats(data, include_peak=True):
            stats = []
            for period in return_periods:
                returns = data[f'{period}D Return (%)'].dropna()
                avg_return = returns.mean()
                t_stat = ttest_1samp(returns, 0).statistic if len(returns) > 1 else float('nan')
                max_return = returns.max()
                max_drawdown = min(returns)  # Correctly using min value for maximum drawdown
                num_profitable = (returns > 0).sum()
                total_count = len(returns)
                pop = num_profitable / total_count if total_count > 0 else 0
                row = {
                    "Period": f"{period}D",
                    "Average Return (%)": avg_return,
                    "Max Return (%)": max_return,
                    "T-Stat": t_stat,
                    "Max Drawdown (%)": max_drawdown,
                    "Number of Times Profitable": num_profitable,
                    "Probability of Profit (POP)": pop * 100,
                    "Total Count": total_count,
                }
                if include_peak:
                    row["Average Peak Return (%)"] = data[f'{period}D Peak Return (%)'].mean()
                stats.append(row)
            return pd.DataFrame(stats)

        stats_df = calculate_stats(breakout_days)
        positive_stats_df = calculate_stats(breakout_days[breakout_days['Daily Return (%)'] > 0])

        # Write to Google Sheets
        parameters = {
            "Volume Threshold (%)": self.volume_threshold * 100,
            "Ticker": self.ticker,
            "Start Date": self.start_date,
            "End Date": self.end_date,
        }
        parameters_df = pd.DataFrame.from_dict(parameters, orient='index', columns=['Value'])
        set_with_dataframe(worksheet_params, parameters_df, include_index=True)
        set_with_dataframe(worksheet_stats, stats_df, include_index=False)
        set_with_dataframe(worksheet_stats, positive_stats_df, include_index=False, row=len(stats_df) + 3)
        set_with_dataframe(worksheet_breakout, breakout_days, include_index=True)

        uniform_format = CellFormat(textFormat=TextFormat(bold=False), horizontalAlignment="LEFT")
        for worksheet in [worksheet_params, worksheet_stats, worksheet_breakout]:
            format_cell_range(worksheet, "A1:Z1000", uniform_format)

        print(f"Spreadsheet '{spreadsheet_name}' successfully updated.")






