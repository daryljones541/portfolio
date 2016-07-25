using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace PersonalPortfolio.Models
{
    public class PortfolioVM
    {
        public string[] StateAbbr { get; set; }
        public List<SelectListItem> StateDropDownList { get; set; }
        public string StateDropDown { get; set; }
        public List<SelectListItem> ReferDropDownList { get; set; }
        public int ReferDropDown { get; set; }
        public List<SelectListItem> Time { get; set; }
        [Required]
        public int TimeSelection { get; set; }
    }
}