import React, { useState } from 'react';
import './Research.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Research = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tickers, setTickers] = useState<string[]>([]);
  const [threshold, setThreshold] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [email, setEmail] = useState('');
  const [spreadsheetName, setSpreadsheetName] = useState('');
  const [serviceAccountDetails, setServiceAccountDetails] = useState({
    type: 'service_account',
    project_id: '',
    private_key_id: '',
    private_key: '',
    client_email: '',
    client_id: '',
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateInputs = () => {
    const newErrors: { [key: string]: string } = {};

    if (!startDate || new Date(startDate) > new Date()) newErrors.startDate = "Start date cannot be in the future.";
    if (!endDate || new Date(endDate) > new Date()) newErrors.endDate = "End date cannot be in the future.";
    if (tickers.length === 0) newErrors.tickers = "Please add at least one ticker.";
    if (!threshold || Number(threshold) <= 0) newErrors.threshold = "Threshold must be greater than 0.";
    if (!email.includes("@")) newErrors.email = "Please enter a valid email address.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateInputs()) return;

    const payload = {
      startDate: new Date(startDate).toISOString().split('T')[0],
      endDate: new Date(endDate).toISOString().split('T')[0],
      tickers,
      threshold: parseFloat(threshold),
      email: email.trim(),
      spreadsheetName: spreadsheetName.trim(),
      serviceAccountDetails: {
        ...serviceAccountDetails,
        private_key: serviceAccountDetails.private_key.replace(/\\n/g, '\n').trim(),
      },
    };

    try {
      setLoading(true);
      const response = await fetch('http://127.0.0.1:8000/api/generate-sheet/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      setLoading(false);
      if (data.status === 'success') {
        toast.success(data.message);
      } else {
        toast.error(`Error: ${data.message}`);
      }
    } catch (error) {
      setLoading(false);
      console.error('Network Error:', error);
      toast.error('An unexpected error occurred.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      if (tickers.length < 5) {
        setTickers([...tickers, inputValue.trim().toUpperCase()]);
        setInputValue('');
      } else {
        toast.error('You can only add up to 5 tickers.');
      }
    }
  };

  const removeTicker = (tickerToRemove: string) => {
    setTickers(tickers.filter((ticker) => ticker !== tickerToRemove));
  };

  const handleServiceAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setServiceAccountDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  return (
    <div className="research-container">
      <div className="content-wrapper">
        <h1 className="research-heading">Sheet Generation</h1>
        <p>Input your desired parameters below.</p>
        <form className="research-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="start-date">Start Date:</label>
            <input
              type="date"
              id="start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            {errors.startDate && <span className="error-message">{errors.startDate}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="end-date">End Date:</label>
            <input
              type="date"
              id="end-date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
            {errors.endDate && <span className="error-message">{errors.endDate}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="ticker">Ticker(s) - Please enter up to 5:</label>
            <div className="ticker-container">
              {tickers.map((ticker, index) => (
                <div className="ticker-bubble" key={index}>
                  {ticker}
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removeTicker(ticker)}
                  >
                    &times;
                  </button>
                </div>
              ))}
              <input
                type="text"
                id="ticker"
                placeholder="Enter stock ticker (e.g., AAPL)"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            {errors.tickers && <span className="error-message">{errors.tickers}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="threshold">Volume Threshold as a Scalar:</label>
            <input
              type="number"
              id="threshold"
              placeholder="Enter threshold value (e.g., 2.5, 3)"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              required
            />
            {errors.threshold && <span className="error-message">{errors.threshold}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Your Email:</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="spreadsheet-name">Spreadsheet Name:</label>
            <input
              type="text"
              id="spreadsheet-name"
              placeholder="Enter spreadsheet name"
              value={spreadsheetName}
              onChange={(e) => setSpreadsheetName(e.target.value)}
              required
            />
          </div>

          <h3>Service Account Details</h3>
          {Object.keys(serviceAccountDetails).map((key) => (
            <div className="form-group" key={key}>
              <label htmlFor={key}>
                {key.replace('_', ' ').toUpperCase()}
                <span className="tooltip" title={`Enter your ${key.replace('_', ' ')}`}> ⓘ </span>
              </label>
              <input
                type="text"
                id={key}
                name={key}
                placeholder={`Enter ${key}`}
                value={serviceAccountDetails[key as keyof typeof serviceAccountDetails]}
                onChange={handleServiceAccountChange}
                required
              />
            </div>
          ))}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Generating...' : 'Generate Sheet(s)'}
          </button>
        </form>
        {loading && (
          <div className="overlay">
            <div className="spinner"></div>
            <p className="loading-text">Generating Sheets...</p>
          </div>
        )}
      </div>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default Research;









