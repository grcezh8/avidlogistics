using System;

namespace AVIDLogistics.Domain.Exceptions
{
    public class InvalidAuditStateException : Exception
    {
        public InvalidAuditStateException(string message) : base(message) { }
    }
}
