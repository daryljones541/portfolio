using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace PersonalPortfolio.Models
{
    public class Event
    {
        public int ID { get; set; }
        public bool AllDay { get; set; }
        public DateTime Date { get; set; }
        public string Location { get; set; }
        public string Title { get; set; }
        public string UserId { get; set; }
    }
}