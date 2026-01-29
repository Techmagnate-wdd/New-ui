const ErrorBoundary = ({ error }) => {
    return (
      <div style={{ textAlign: "center", padding: "50px", color: "red" }}>
        <h1>Something went wrong! 🚨</h1>
        <p>{error.message || "An unexpected error occurred."}</p>
      </div>
    );
  };
  
  export default ErrorBoundary;
  