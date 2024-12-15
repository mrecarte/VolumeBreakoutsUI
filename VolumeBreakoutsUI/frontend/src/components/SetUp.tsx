import './SetUp.css';

const SetUp = () => {
  return (
    <div className="setup-container">
      <div className="content-wrapper">
        <h1 className="setup-heading">Set Up Instructions</h1>
        <p>Follow the steps below to configure access to Google Sheets via API:</p>
        <ol className="setup-steps">
          <li>
            Go to the <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer">Google Cloud Console</a>.
          </li>
          <li>
            Create a new project or select an existing one.
          </li>
          <li>
            Navigate to <strong>APIs & Services</strong> → <strong>Library</strong>.
            Search for and enable the <strong>Google Sheets API</strong> and <strong>Google Drive API</strong>.
          </li>
          <li>
            Go to <strong>APIs & Services</strong> → <strong>Credentials</strong>.
          </li>
          <li>
            Click <strong>Create Credentials</strong> → <strong>Service Account</strong>.
          </li>
          <li>
            Fill in the required details and click <strong>Create</strong>.
          </li>
          <li>
            After creating the service account, go to the <strong>Keys</strong> section and click <strong>Add Key</strong> → <strong>Create New Key</strong>.
            Select <strong>JSON</strong>. A file will download automatically.
          </li>
          <li>
            Rename the downloaded file to <code>credentials.json</code> for easy finding.
          </li>
        </ol>
        <h2>Example `credentials.json` File</h2>
        <pre className="code-block">
          {`{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "your-private-key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\\nYOUR-PRIVATE-KEY\\n-----END PRIVATE KEY-----\\n",
  "client_email": "your-service-account-email",
  "client_id": "your-client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/your-service-account-email"
}`}
        </pre>

      </div>
    </div>
  );
};

export default SetUp;

