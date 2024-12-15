from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .Strategy1 import VolumeBreakoutDetect
import yfinance as yf

@csrf_exempt
def generate_sheet(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)

            # Debugging: Log received data
            print("Received Data:", data)

            # Extract inputs from the request
            start_date = data.get("startDate")
            end_date = data.get("endDate")
            tickers = data.get("tickers")
            threshold = float(data.get("threshold"))
            email = data.get("email")
            spreadsheet_name_prefix = data.get("spreadsheetName")
            service_account_details = data.get("serviceAccountDetails")

            # Validate inputs
            if not start_date or not end_date or not tickers or not email or not service_account_details:
                return JsonResponse({"status": "error", "message": "Missing required fields."}, status=400)

            # Validate ticker symbols before proceeding
            invalid_tickers = []
            for ticker in tickers:
                try:
                    # Validate ticker using yfinance
                    test_data = yf.Ticker(ticker).history(period="1d")
                    if test_data.empty:
                        invalid_tickers.append(ticker)
                except Exception as e:
                    print(f"Validation error for ticker {ticker}: {e}")
                    invalid_tickers.append(ticker)

            # Check for invalid tickers
            if invalid_tickers:
                return JsonResponse({
                    "status": "error",
                    "message": f"Invalid or unavailable ticker(s): {', '.join(invalid_tickers)}"
                }, status=400)

            # Loop through tickers and create sheets
            for ticker in tickers:
                try:
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

                except Exception as e:
                    # Log any errors per ticker
                    print(f"Error processing ticker {ticker}: {e}")
                    return JsonResponse({
                        "status": "error",
                        "message": f"Failed to process ticker '{ticker}'. {str(e)}"
                    }, status=500)

            return JsonResponse({"status": "success", "message": "Sheets generated successfully!"})

        except Exception as e:
            # General error handling
            print("Error:", e)
            return JsonResponse({"status": "error", "message": str(e)}, status=500)

    return JsonResponse({"status": "error", "message": "Invalid HTTP method."}, status=405)

