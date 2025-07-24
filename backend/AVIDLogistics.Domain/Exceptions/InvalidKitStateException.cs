using System;

namespace AVIDLogistics.Domain.Exceptions
{
    public class InvalidKitStateException : Exception
    {
        public InvalidKitStateException(string message) : base(message) { }
    }
}
