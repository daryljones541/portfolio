using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PersonalPortfolio.Models
{
    public class Dealer : Player
    {
        private Deck deck;

        public Dealer() : base()
        {
            deck = new Deck();
            deck.Shuffle();
            GameOver = false;
        }
        
        public override void Reset()
        {
            base.Reset();
            deck = new Deck();
            deck.Shuffle();
        }

        public Card Deal()
        {
            return deck.Deal();
        }

        public void Play()
        {
            while (Score < 17)
            {
                Hit(Deal());
            }
        }
        public bool GameOver { get; set; }
    }
}
