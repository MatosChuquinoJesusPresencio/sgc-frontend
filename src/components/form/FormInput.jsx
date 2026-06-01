const FormInput = ({ label, type, placeholder, register, name, validation, error, ...rest }) => {
    return (
        <div className="form-group">
            {label && (
                <label className="form-label">{label}</label>
            )}
            {type === "select" ? (
                <select
                    className={`form-select ${error ? "error" : ""}`}
                    {...register(name, validation)}
                    {...rest}
                >
                    {placeholder && <option value="">{placeholder}</option>}
                    {rest.children}
                </select>
            ) : type === "textarea" ? (
                <textarea
                    className={`form-input ${error ? "error" : ""}`}
                    placeholder={placeholder}
                    {...register(name, validation)}
                    {...rest}
                />
            ) : (
                <input
                    type={type || "text"}
                    className={`form-input ${error ? "error" : ""}`}
                    placeholder={placeholder}
                    {...register(name, validation)}
                    {...rest}
                />
            )}
            {error && (
                <div className="form-error">{error.message}</div>
            )}
        </div>
    );
};

export default FormInput;
