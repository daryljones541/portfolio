using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PersonalPortfolio.Models
{
    public class Player : BJHand
    {
        public Player() : base()
        {
            Stand = false;
        }

        public void Hit(Card c)
        {
            AddCard(c);
        }

        public bool CanHit()
        {
            return (!IsBusted && !Stand);
        }

        public virtual void Reset()
        {
            cards = new List<Card>();
            Stand = false;
            IsWinner = false;
        }

        public bool Stand { get; set; }
    }
}
