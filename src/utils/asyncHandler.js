const asyncHnadler = (requstHandler) => {
    return (req,res,next) => {
        Promise.resolve(requstHandler(req,res,next)).catch((err) => next(err)); 
    }
}

export default  asyncHnadler;