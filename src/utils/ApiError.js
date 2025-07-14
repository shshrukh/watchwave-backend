class ApiError extends Error {
    constructor(statusCode, massage = "something is went wrong", errors = [], statck = ""){
        super(massage);
        this.statusCode = statusCode;
        this.data = null;
        this.massage = massage; 
        this.succes = false;
        this.errors = errors;
        
    }
}

export default ApiError;