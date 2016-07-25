using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PersonalPortfolio.Models
{
    public class Hand
    {
        protected List<Card> cards = new List<Card>();

        public Hand() { }
        public Hand(Deck d, int numCards)
        {
            for (int i = 1; i <= numCards; i++)
                cards.Add(d.Deal());
        }

        public int NumCards
        {
            get
            {
                return cards.Count;
            }
        }

        public void AddCard(Card c)
        {
            cards.Add(c);
        }

        public Card GetCard(int index)
        {
            return cards[index];
        }

        public int IndexOf(Card c)
        {
            return cards.IndexOf(c);
        }

        public int IndexOf(int value)
        {
            int i = 0;
            foreach (Card c in cards)
            {
                if (c.Value == value)
                    return i;
                i++;
            }
            return -1;
        }

        public int IndexOf(int value, int suit)
        {
            int i = 0;
            foreach (Card c in cards)
            {
                if (c.Value == value && c.Suit == suit)
                    return i;
                i++;
            }
            return -1;
        }

        public bool HasCard(Card c)
        {
            return cards.Contains(c);
        }

        public bool HasCard(int value)
        {
            foreach (Card c in cards)
                if (c.Value == value)
                    return true;
            return false;
        }

        public bool HasCard(int value, int suit)
        {
            foreach (Card c in cards)
                if (c.Value == value && c.Suit == suit)
                    return true;
            return false;
        }

        public Card Discard(int index)
        {
            Card c = cards[index];
            cards.Remove(c);
            return c;
        }

        public override string ToString()
        {
            string output = "";
            foreach (Card c in cards)
                output += (c.ToString() + "\n");
            return output;
        }
    }
}
