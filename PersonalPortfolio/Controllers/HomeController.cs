using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using PersonalPortfolio.Models;
using System.Net.Mail;
using Microsoft.AspNet.Identity;
using System.Data.Entity;

namespace PersonalPortfolio.Controllers
{
    public class HomeController : Controller
    {
        private List<Feedback> feedbackList;

        // GET: Home
        public ActionResult Index()
        {
            // create dropdown list for Async Form's How Did You Hear About Us field
            var referenceDropDown = new List<SelectListItem>();
            var referredBy = new string[] { "Please Select", "Friend", "Newspaper", "Magazine", "Online", "Other" };
            int x = 0;
            foreach (string refer in referredBy)
            {
                referenceDropDown.Add(new SelectListItem() { Text = refer, Value = x.ToString() });
                x++;
            }
            PortfolioVM viewModel = new PortfolioVM { ReferDropDownList = referenceDropDown };

            // create dropdown list for Powered by Weather Underground's State field
            var stateDropDown = new List<SelectListItem>();
            var stateAbbr = new string[] { "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY" };
            var states = new string[] { "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Disrict of Columbia", "Florida", "Georgia", "Hawaii", "Idaho", "illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming" };
            x = 0;
            foreach (string state in states)
            {
                stateDropDown.Add(new SelectListItem() { Text = state, Value = stateAbbr[x] });
                x++;
            }
            viewModel.StateDropDownList = stateDropDown;
            viewModel.StateAbbr = stateAbbr;
            viewModel.StateDropDown = "OR";
            // Check if calendar events have already been set; if not, set them
            haveSomethingInSession();
            PopulateTime(viewModel);
            // set Session variable to check for session timeout
            if (Session["session"] == null)
            {
                Session["session"] = true;
            }
            return View(viewModel);
        }

        // GET: About
        public ActionResult About()
        {
            return View();
        }
        // GET: Contact
        public ActionResult Contact()
        {
            // Create the category list for the Contact page's Contact Me form
            var categoryList = new List<SelectListItem>();
            categoryList.Add(new SelectListItem() { Text = "Please Select", Value = "0" });
            string[] categories = { "Job Offer", "Coding Question", "Site Feedback" };
            int position = 1;
            while (position <= categories.Length)
            {
                categoryList.Add(new SelectListItem() { Text = categories[position - 1], Value = position.ToString() });
                position++;
            }
            ViewBag.Categories = categoryList;

            return View();
        }

        // AJAX called by Async Form's View All button 
        public JsonResult GetFeedback()
        {
            if (Session["session"]==null)
            {
                // session timed out
                Session["session"] = true;
                return Json("timeout");
            }
            if (Session["feedbackList"] != null)
            {
                feedbackList = (List<Feedback>)Session["feedbackList"];
            }
            else
            {
                feedbackList = new List<Feedback>();
            }
            return Json(feedbackList);
        }

        [HttpPost]
        // AJAX called by Async Form to submit user feedback
        public bool AddFeedback(string date, string referrer, string name, string email, string phone, string feedback)
        {
            bool sessionActive = true;
            if (Session["session"] == null)
            {
                // session timed out
                Session["session"] = true;
                sessionActive = false;
            }  
            if (referrer == "Please Select") referrer = "";
            Feedback viewModel = new Feedback { Name = name, ReferredBy = referrer, Email = email, Phone = phone, CustomerFeedback = feedback };
            viewModel.Date = Convert.ToDateTime(date);
            if (Session["feedbackList"] != null)
            {
                feedbackList = (List<Feedback>)Session["feedbackList"];
            }
            else
            {
                feedbackList = new List<Feedback>();
            }
            feedbackList.Add(viewModel);
            Session["feedbackList"] = feedbackList;
            return sessionActive;
        }

        [HttpPost]
        // AJAX called to email me user's message
        public bool SendMessage(string category, string subject, string email, string message)
        {
            if (category == "Please Select") category = "None";
            try
            {
                using (var client = new SmtpClient())
                {
                    using (var eMessage = new MailMessage())
                    {
                        eMessage.From = (new MailAddress("noreply@mail.darylpjones.com", "Daryl P. Jones Portfolio"));
                        eMessage.To.Add("daryljones541@gmail.com");
                        eMessage.Subject = "Portfolio Message";
                        eMessage.IsBodyHtml = true;
                        eMessage.Body = "<p>Category: " + category + "</p><p>Subject: " + subject + "</p>" +
                            "<p>From: " + email + "</p>" + "<p>Message: " + message + "</p>";
                        client.Send(eMessage);
                        return true;
                    }
                }
            }

            // excellent debug script - outputs exceptions to Output window
            catch (Exception ex)
            {
                Exception ex2 = ex;
                string errorMessage = string.Empty;
                while (ex2 != null)
                {
                    errorMessage += ex2.ToString();
                    ex2 = ex2.InnerException;
                }
                System.Diagnostics.Debug.Write(errorMessage);
                return false;
            }
        }

        // session timeout can cause there to be nothing
        private void haveSomethingInSession()
        {
            if (Session["events"] == null)
            {
                Random random = new Random();
                var now = DateTime.Now;
                List<Event> events = new List<Event>();
                Event e = new Event { ID = 1, Date = new DateTime(now.Year, now.Month, now.Day, now.Hour, (30 * random.Next(0, 1)), 0), Location = "Your computer", Title = "You paid my portfolio a visit today.", AllDay = false };
                events.Add(e);
                e = new Event { ID = 2, Date = new DateTime(now.Year, now.Month, now.Day), Location = "My Computer", Title = "I have prepared a second event for you to view today.", AllDay = true };
                events.Add(e);
                now = now.AddMonths(-1);
                e = new Event { ID = 3, Date = new DateTime(now.Year, now.Month, random.Next(1, 28), random.Next(0, 23), (30 * random.Next(0, 1)), 0), Location = "Sample Location", Title = "Here's a sample event for last month.", AllDay = false };
                events.Add(e);
                now = now.AddMonths(2);
                e = new Event { ID = 4, Date = new DateTime(now.Year, now.Month, random.Next(1, 28), random.Next(0, 23), (30 * random.Next(0, 1)), 0), Location = "Sample Location", Title = "Here's a sample event for next month.", AllDay = true };
                events.Add(e);
                Session["events"] = events;
            }
        }

        // AJAX called by Calendar Add Event
        public bool AddEvent(string date, string time, string location, string title)
        {
            // flag to tell calling function whether or not Session is alive
            bool sessionActive = true;
            DateTime eventDate = Convert.ToDateTime(date);
            if (time != "All Day")
            {
                TimeSpan eventTime = Convert.ToDateTime(time).TimeOfDay;
                eventDate = eventDate.Add(eventTime);
            }
            Event e = new Event { Date = eventDate, Location = location, Title = title };
            if (time == "All Day")
            {
                e.AllDay = true;
            }
            else
            {
                e.AllDay = false;
            }
            // If user is logged in, save event to the database
            if (User.Identity.IsAuthenticated)
            {
                var userId = User.Identity.GetUserId();
                e.UserId = userId;
                using (var db = new PersonalPortfolioContext())
                {
                    db.Events.Add(e);
                    db.SaveChanges();
                } 
            }
            // if no one is logged in, save event to Session
            else
            {
                if (Session["session"] == null)
                {
                    // session timed out
                    Session["session"] = true;
                    sessionActive = false;
                }
                // make sure something is in Session
                haveSomethingInSession();
                // events are stored in Session list        
                var events = (List<Event>)Session["events"];
                // get max ID to divine the next event ID
                int id = events.Max(i => i.ID);
                id++;
                e.ID = id;
                events.Add(e);
                // put updated event list back in Session
                Session["events"] = events;
            }
            // return whether or not Session was still alive
            return sessionActive;
        }

        // AJAX called by Calendar Edit Event
        public string UpdateEvent(int id, string date, string time, string location, string title)
        {
            // flag to tell calling function whether or not Session is alive
            string status = "True";
            DateTime eventDate = Convert.ToDateTime(date);
            if (time != "All Day")
            {
                TimeSpan eventTime = Convert.ToDateTime(time).TimeOfDay;
                eventDate = eventDate.Add(eventTime);
            }
            Event e = new Event { Date = eventDate, Location = location, Title = title };
            if (time == "All Day")
            {
                e.AllDay = true;
            }
            else
            {
                e.AllDay = false;
            }
            // If user is logged in, edit event from database
            if (User.Identity.IsAuthenticated)
            {
                var userId = User.Identity.GetUserId();
                using (var db = new PersonalPortfolioContext())
                {
                    var updateEvent = db.Events.SingleOrDefault(x => x.ID == id);
                    // make sure the event really exists
                    if (updateEvent != null)
                    {
                        // make sure the event belongs to the logged in user
                        if (updateEvent.UserId == userId)
                        {
                            // everything checks out so update and save the event
                            updateEvent.Date = e.Date;
                            updateEvent.AllDay = e.AllDay;
                            updateEvent.Location = e.Location;
                            updateEvent.Title = e.Title;
                            db.Entry(updateEvent).State = EntityState.Modified;
                            db.SaveChanges();
                        }
                    }
                    else status = "None";
                }
            }
            // if no one is logged in, edit event in Session
            else
            {
                // check if Session is alive
                if (Session["session"] == null)
                {
                    // session timed out
                    Session["session"] = true;
                    status = "False";
                }
                else
                {
                    // make sure some events are in Session
                    haveSomethingInSession();
                    // events are stored in Session list
                    var events = (List<Event>)Session["events"];
                    var updateEvent = events.SingleOrDefault(x => x.ID == id);
                    // if event can be found, 
                    if (updateEvent != null)
                    {
                        updateEvent.Date = e.Date;
                        updateEvent.AllDay = e.AllDay;
                        updateEvent.Location = e.Location;
                        updateEvent.Title = e.Title;
                    }
                    else status = "None";
                }
            }
            return status;
        }

        public string DeleteEvent(int id)
        {
            if (User.Identity.IsAuthenticated)
            {
                var userid = User.Identity.GetUserId();
                using (var db = new PersonalPortfolioContext())
                {
                    var eventToRemove = db.Events.Find(id);
                    if (eventToRemove == null) return "error";
                    // make sure the event belongs to the logged in user before deleting
                    if (eventToRemove.UserId == userid)
                    {
                        db.Events.Remove(eventToRemove);
                        db.SaveChanges();
                        return "deleted";
                    }
                    else return "error";
                }
            }
            else
            {
                haveSomethingInSession();
                var events = (List<Event>)Session["events"];
                var eventToRemove = events.SingleOrDefault(e => e.ID == id);
                if (eventToRemove != null)
                {
                    events.Remove(eventToRemove);
                    Session["events"] = events;
                    return "deleted";
                }
                else return "error";
            }
        }
        
        // AJAX called by Home/Index's Calendar to get the list of events for the current month
        public JsonResult GetList(int month, int year)
        {
            month++;
            if (User.Identity.IsAuthenticated)
            {
                var userId = User.Identity.GetUserId();
                using (var db = new PersonalPortfolioContext())
                {
                    var events = db.Events.Where(e => e.UserId == userId && e.Date.Month == month && e.Date.Year == year).ToList();
                    return Json(events);
                } 
            }
            else
            {
                haveSomethingInSession();
                var events = (List<Event>)Session["events"];
                var eventsThisMonth = events.Where(x => x.Date.Month == month && x.Date.Year == year);
                return Json(eventsThisMonth);
            }
        }
        // Called internally to fill eventVM's select list with times
        private PortfolioVM PopulateTime(PortfolioVM eventVM)
        {
            eventVM.Time = new List<SelectListItem>();
            eventVM.Time.Add(new SelectListItem() { Text = "All Day", Value = "0" });
            DateTime times = DateTime.ParseExact("00:00", "HH:mm", null);
            DateTime endTime = DateTime.ParseExact("23:30", "HH:mm", null);
            TimeSpan interval = new TimeSpan(0, 30, 0);
            int position = 1;
            while (times <= endTime)
            {
                eventVM.Time.Add(new SelectListItem() { Text = times.ToShortTimeString(), Value = position.ToString() });
                times = times.Add(interval);
                position++;
            }
            return eventVM;
        }
        // AJAX called each game turn to get the current state of the game
        // this function accepts flags that tell it what functions it should be doing
        // and returns the state of the game (see below for returned state)
        public JsonResult GameTurn(bool playerHit, bool dealerHit, bool userStands, bool startNewGame, bool resetScores)
        {
            // INPUT FLAGS:
            //      playerHit - deal to player if possible (if can hit) this turn
            //      dealerHit - deal to dealer if possible (if can hit) this turn
            //      startNewGame - get new hands for player and dealer
            //      resetScores - get new scores for player and dealer (initially set to 0)
            bool sessionActive = true;
            if (Session["session"] == null)
            {
                // session timed out
                Session["session"] = true;
                playerHit = true;
                dealerHit = true;
                userStands = false;
                startNewGame = true;
                resetScores = true;
                sessionActive = false;
            }
            var user = new Player();
            var computer = new Dealer();
            // if the startNewGame flag is not set, get the stored player and dealer
            if (!startNewGame)
            {
                if (Session["player"] != null)
                {
                    user = (Player)Session["player"];
                }
                if (Session["dealer"] != null)
                {
                    computer = (Dealer)Session["dealer"];
                }
            }
            // if the userStands flag is set, set the player's Stand property to true
            if (userStands) user.Stand = true;
            // if there is no winner, proceed to check to see if player or dealer can hit
            if (!user.IsWinner && !computer.IsWinner)
            {
                // make sure playerHit flag is set or the player has no cards
                if (playerHit || user.NumCards==0)
                {
                    // make sure player can hit (is not bust or standing)
                    if (user.CanHit())
                    {
                        // deal one card to player
                        user.Hit(computer.Deal());
                    }
                }
                // make sure dealerHit flag is set or computer has no cards
                if (dealerHit || computer.NumCards==0)
                {
                    // make sure the computer can hit (is not bust or standing)
                    if (computer.CanHit())
                    {
                        // deal one card to computer
                        computer.Hit(computer.Deal());
                        // check if value over 15, if so, stand
                        if (computer.Score > 15)
                        {
                            computer.Stand = true;
                        }
                    }
                }
            }
            int playerScore = 0;
            int dealerScore = 0;
            // check if resetScores flag is set, if not, get stored scores
            if (!resetScores)
            {
                if (Session["playerScore"] != null)
                {
                    playerScore = (int)Session["playerScore"];
                }
                if (Session["dealerScore"] != null)
                {
                    dealerScore = (int)Session["dealerScore"];
                }
            }
            // check if a winner has already been declared for the current game, if not, proceed to check for winner
            if (!user.IsWinner && !computer.IsWinner)
            { 
                // if computer busted and user did not, declare user the winner
                if (!user.IsBusted && computer.IsBusted)
                {
                    playerScore++;          
                    user.IsWinner = true;
                }
                // if user busted and computer did not, declare computer the winner
                else if (user.IsBusted && !computer.IsBusted)
                {
                    dealerScore++;      
                    computer.IsWinner = true;
                }
                // check if neither user nor computer can hit (they both stand)
                else if (!user.CanHit() && !computer.CanHit())
                {
                    // if user's card value is higher, declare user winner
                    if (user.Score > computer.Score && !user.IsBusted)
                    {
                        playerScore++;
                        user.IsWinner = true;
                    }
                    // if computer's card value is higher, declare computer winner
                    else if (computer.Score > user.Score && !computer.IsBusted)
                    {
                        dealerScore++;
                        computer.IsWinner = true;
                    }
                    // if both values are equal, set both winner flags to true, but do not increments either's scores
                    else if (user.Score == computer.Score)
                    {
                        user.IsWinner = true;
                        computer.IsWinner = true;
                    }
                }
            }
            // get user's card's filenames
            var userCard = new string[user.NumCards];
            for (int x = 0; x < user.NumCards; x++)
            {
                userCard[x] = "Images/Cards/" + user.GetCard(x).FileName;
            }
            // get computer's card's filenames
            var computerCard = new string[computer.NumCards];
            for (int x = 0; x < computer.NumCards; x++)
            {
                computerCard[x] = "Images/Cards/" + computer.GetCard(x).FileName;
            }
            // get the status of whether the user can hit or not to return to AJAX caller
            bool playerStatus = user.CanHit();
            // set the user and computer labels based on the current state
            string userLabel="Player";
            string computerLabel="Dealer";
            if (user.Stand) userLabel = "Player Stands!";                              
            if (computer.Stand) computerLabel = "Dealer Stands!";
            if (user.IsWinner && computer.IsWinner)
            {
                userLabel = "Player Tied!";
                computerLabel = "Dealer Tied!";
            }         
            else if (user.IsWinner) userLabel = "Player Won!";
            else if (computer.IsWinner) computerLabel = "Dealer Won!";
            if (user.IsBusted) userLabel = "Player Busted!";
            if (computer.IsBusted) computerLabel = "Dealer Busted!";
            bool gameOver = false;
            // if there's a winner declared or someone busted, the game is over
            if (user.IsWinner || computer.IsWinner) gameOver = true;
            if (user.IsBusted || computer.IsBusted) gameOver = true;
            // saved current state in Session variables
            Session["playerScore"] = playerScore;
            Session["dealerScore"] = dealerScore;
            Session["player"] = user;
            Session["dealer"] = computer;
            // return current state to AJAX caller
            //      gameOver - flag (true = game over)
            //      userLabel - message about user's state to display to user
            //      computerLabel - message about computer's state to display to user
            //      playerStatus - flag (true = can hit)
            //      userCards - array of user's cards' filename strings
            //      computerCards - array of computer's cards' filename strings
            //      playerScore - player's score (tally of wins, which is displayed on scoreboard at top of board)
            //      dealerScore - computer's score ( " )  
            //      sessionActive - true if session was active when called; false if session timed out    
            return Json(new { gameOver = gameOver, userLabel = userLabel, computerLabel = computerLabel, playerStatus = playerStatus, userCards = userCard, computerCards = computerCard, playerScore = playerScore, dealerScore = dealerScore, sessionActive=sessionActive });
        }
    }
}