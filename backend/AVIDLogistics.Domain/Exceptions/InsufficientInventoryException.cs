using System;

namespace AVIDLogistics.Domain.Exceptions
{
    public class InsufficientInventoryException : Exception
    {
        public InsufficientInventoryException(string message) : base(message) { }
    }
}
