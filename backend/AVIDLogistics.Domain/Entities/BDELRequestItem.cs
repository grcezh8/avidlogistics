using System;

namespace AVIDLogistics.Domain.Entities
{
    public class BDELRequestItem
    {
        public int ItemId { get; private set; }
        public int RequestId { get; private set; }
        public int EDID { get; private set; }
        public string ItemDescription { get; private set; }
        public int Quantity { get; private set; }

        public BDELRequestItem(int requestId, int edid, string itemDescription, int quantity)
        {
            RequestId = requestId;
            EDID = edid;
            ItemDescription = itemDescription ?? throw new ArgumentNullException(nameof(itemDescription));
            Quantity = quantity;
        }
    }
}
