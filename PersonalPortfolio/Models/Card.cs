using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
//using System.Web;
//using System.Web.UI;
using System.Web.UI.WebControls;

namespace PersonalPortfolio.Models
{
    public class Card
    {
        private static string[] values = { "", "Ace", "2", "3", "4", "5", "6", "7", "8", "9", "Ten", "Jack", "Queen", "King" };
        private static string[] suits = { "", "Clubs", "Diamonds", "Hearts", "Spades" };
        private static Random generator = new Random();

        private int value;
        private int suit;

        public Card()
        {
            value = generator.Next(1, 14);
            suit = generator.Next(1, 5); 
        }

        public Card(int v, int s)
        {
            value = v;
            suit = s;
        }

        public int Value
        {
            get
            {
                return this.value;
            }
            set
            {
                this.value = value;
            }
        }

        public int Suit
        {
            get
            {
                return this.suit;
            }
            set
            {
                this.suit = value;
            }
        }

        public bool IsRed()
        {
            return !IsBlack();
        }

        public bool IsBlack()
        {
            if (IsSpade() || IsClub())
                return true;
            else
                return false;
        }

        public bool IsFaceCard()
        {
            switch (value)
            {
                case 11: case 12: case 13:
                    return true;
                default:
                    return false;
            }
        }

        public bool IsAce()
        {
            if (value == 1)
                return true;
            else
                return false;
        }

        public bool IsClub()
        {
            if (suit == 1)
                return true;
            else
                return false;
        }

        public bool IsDiamond()
        {
            if (suit == 2)
                return true;
            else
                return false;
        }

        public bool IsHeart()
        {
            if (suit == 3)
                return true;
            else
                return false;
        }

        public bool IsSpade()
        {
            if (suit == 4)
                return true;
            else
                return false;
        }

        public bool HasMatchingValue(Card other)
        {
            if (other.Value == value)
                return true;
            else
                return false;
        }

        public string FileName
        {
            get
            {
                return "card" + values[value].Substring(0, 1) + 
                       suits[suit].Substring(0, 1) + ".jpg";
            }
        }

        public override string ToString()
        {
            return values[value] + " of " + suits[suit];
        }

        public override bool Equals(object obj)
        {
            Card c = (Card)obj;
            if (c.value == this.value && c.suit == this.suit)
                return true;
            else
                return false;
        }

        public override int GetHashCode()
        {
            return this.ToString().GetHashCode();
        }
    }
}
