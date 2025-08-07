using System;

namespace AVIDLogistics.Domain.Entities.Base
{
    /// <summary>
    /// Base class for all domain entities.
    /// Provides common functionality and EF Core compatibility.
    /// </summary>
    public abstract class Entity
    {
        /// <summary>
        /// Protected constructor for Entity Framework Core.
        /// This allows EF Core to create instances while maintaining encapsulation.
        /// </summary>
        protected Entity() { }

        /// <summary>
        /// Gets the unique identifier for this entity.
        /// </summary>
        public int Id { get; protected set; }

        /// <summary>
        /// Determines whether the specified object is equal to the current entity.
        /// </summary>
        public override bool Equals(object obj)
        {
            if (obj == null || !(obj is Entity))
                return false;

            if (ReferenceEquals(this, obj))
                return true;

            if (GetType() != obj.GetType())
                return false;

            var entity = (Entity)obj;
            return Id != 0 && entity.Id != 0 && Id == entity.Id;
        }

        /// <summary>
        /// Returns a hash code for this entity.
        /// </summary>
        public override int GetHashCode()
        {
            return (GetType().GetHashCode() * 907) + Id.GetHashCode();
        }

        /// <summary>
        /// Overloaded equality operator.
        /// </summary>
        public static bool operator ==(Entity a, Entity b)
        {
            if (ReferenceEquals(a, null) && ReferenceEquals(b, null))
                return true;

            if (ReferenceEquals(a, null) || ReferenceEquals(b, null))
                return false;

            return a.Equals(b);
        }

        /// <summary>
        /// Overloaded inequality operator.
        /// </summary>
        public static bool operator !=(Entity a, Entity b)
        {
            return !(a == b);
        }
    }

    /// <summary>
    /// Base class for aggregate root entities.
    /// Aggregate roots are the entry points to aggregates in DDD.
    /// </summary>
    public abstract class AggregateRoot : Entity
    {
        /// <summary>
        /// Protected constructor for Entity Framework Core.
        /// </summary>
        protected AggregateRoot() : base() { }
    }
}