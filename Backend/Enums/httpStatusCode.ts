enum HTTP_statusCode{
    OK = 200,
    noChange =301,
    TaskFailed = 304,
    BadRequest = 400,
    unAuthorized = 401,
    NoAccess = 403,
    NotFound = 404,
    Conflict = 409,
    Expired = 410,
    InternalServerError = 500,
    ServiceUnavailabe = 503
}

export default HTTP_statusCode