using System;

namespace AVIDLogistics.Domain.Exceptions
{
    public class InvalidDeliveryStateException : Exception
    {
        public InvalidDeliveryStateException(string message) : base(message) { }
    }
}
