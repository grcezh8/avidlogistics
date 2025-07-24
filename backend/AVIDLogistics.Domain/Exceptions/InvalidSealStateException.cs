using System;

namespace AVIDLogistics.Domain.Exceptions
{
    public class InvalidSealStateException : Exception
    {
        public InvalidSealStateException(string message) : base(message) { }
    }
}
