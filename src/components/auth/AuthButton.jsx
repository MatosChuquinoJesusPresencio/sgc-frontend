const AuthButton = ({ type, text, loadingText, loading, id }) => {
    return (
        <button
            type={type}
            id={id}
            disabled={loading}
            className="btn btn-primary w-full py-2"
        >
            {loading && <span className="spinner" />}
            {loading ? loadingText : text}
        </button>
    );
};

export default AuthButton;
