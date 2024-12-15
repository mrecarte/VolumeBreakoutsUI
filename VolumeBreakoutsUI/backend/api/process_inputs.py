from Strategy1 import VolumeBreakoutDetect

def main():
    start_date = input("Enter start date (YYYY-MM-DD): ")
    end_date = input("Enter end date (YYYY-MM-DD, leave blank for current date): ")
    email = input("Enter your email: ")
    spreadsheet_name_prefix = input("Enter prefix for Google Sheet names: ")
    threshold = float(input("Enter volume threshold (e.g., 3): "))

    # Allow up to 5 tickers
    tickers = []
    print("Enter up to 5 tickers. Type 'done' when finished:")
    while len(tickers) < 5:
        ticker = input(f"Enter ticker {len(tickers) + 1}: ").upper()
        if ticker == "DONE":
            break
        tickers.append(ticker)

    # Service account details
    service_account_details = {
        "type": "service_account",
        "project_id": input("Enter project ID: "),
        "private_key_id": input("Enter private key ID: "),
        "private_key": input("Enter private key: "),
        "client_email": input("Enter client email: "),
        "client_id": input("Enter client ID: "),
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": input("Enter client x509 cert URL: ")
    }

    for ticker in tickers:
        print(f"Processing ticker: {ticker}")
        spreadsheet_name = f"{spreadsheet_name_prefix}_{ticker}"
        volume_breakout = VolumeBreakoutDetect(
            start_date=start_date,
            end_date=end_date,
            ticker=ticker,
            threshold=threshold,
            service_account_details=service_account_details,
            email=email
        )
        volume_breakout.generate_google_sheet(spreadsheet_name)

if __name__ == "__main__":
    main()
