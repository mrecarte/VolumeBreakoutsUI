import './Background.css'; // Create a CSS file for styling this page

const Background = () => {
  return (
    <div className="background-container">
      <div className="content-wrapper">
        <h1 className="background-heading">Momentum Investing and Breakout Strategies</h1>
        <p>
          Momentum investing has long been a cornerstone of trading strategies, leveraging the principle that stocks showing strong performance in the short term tend to continue their trajectory. This project, grounded in quantitative analysis and personal market insights, explores the potential for automating a Price/Volume Breakout Strategy. The strategy aims to capitalize on short-term price momentum combined with significant volume surges, which often precede substantial stock movements.
        </p>
        <h2 className="sub-heading">The Rationale for this Approach</h2>
        <p>
          The rationale for this approach lies in three fundamental drivers of momentum:
        </p>
        <ul className="background-list">
          <li>
            <strong>Event-Driven Momentum:</strong> Stocks frequently experience surges in price and volume due to specific catalysts such as earnings announcements or macroeconomic policy changes. These events create market inefficiencies that astute traders can exploit by analyzing pre- and post-event price trends.
          </li>
          <li>
            <strong>Value Correction Momentum:</strong> Undervalued stocks demonstrating resilience relative to their sector or peers can break out during broader market movements, presenting opportunities to capture significant upside potential. This approach identifies stocks poised for value recognition beyond current market perceptions.
          </li>
          <li>
            <strong>Quantitative Momentum:</strong> Systematic strategies leveraging historical returns—specifically trailing 3-month and 6-month excess returns—enable the development of robust, repeatable decision-making frameworks for identifying high-performing stocks with precision.
          </li>
        </ul>
        <h2 className="sub-heading">Project Highlights</h2>
        <p>
          This project incorporates these conceptual insights into a structured analytical framework that:
        </p>
        <ul className="background-list">
          <li>
            Utilizes comprehensive historical stock data to identify breakout patterns based on nuanced volume and price movements.
          </li>
          <li>
            Conducts in-depth analysis of post-breakout performance across multiple holding periods.
          </li>
          <li>
            Integrates cutting-edge tools like Python, yfinance, and Google Sheets to ensure seamless data acquisition, rigorous analysis, and dynamic reporting.
          </li>
        </ul>
        <p>
          By systematically automating the identification of volume breakouts and their associated returns, this research seeks to answer a critical market question: <strong>Can a data-driven approach to momentum investing consistently identify profitable trading opportunities?</strong>
        </p>
        <p>
          The insights derived from this study will serve as the foundation for investing, ultimately enabling broader accessibility and scalability of this sophisticated trading strategy.
        </p>
      </div>
    </div>
  );
};

export default Background;
