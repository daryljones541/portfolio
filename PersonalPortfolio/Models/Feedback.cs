using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace PersonalPortfolio.Models
{
    public class Feedback
    {
        public DateTime Date { get; set; }
        public string Name { get; set; }
        public string ReferredBy { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string CustomerFeedback { get; set; }
    }
}