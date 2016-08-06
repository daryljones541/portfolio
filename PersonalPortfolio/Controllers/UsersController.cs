using System.Web.Mvc;
using PersonalPortfolio.Models;
using Microsoft.AspNet.Identity;
using reCaptcha;
using System.Net.Mail;
using System;
using Microsoft.Owin.Security;
using System.Web;

namespace PersonalPortfolio.Controllers
{
    public class UsersController : Controller
    {
        private UserManager<User> userManager = new UserManager<User>(
                new Microsoft.AspNet.Identity.EntityFramework.UserStore<User>(new PersonalPortfolioContext()));

        // GET: Register
        public ActionResult Register()
        {
            // if a user is already logged in, redirect to the home page
            if (Request.IsAuthenticated == true) return RedirectToAction("Index", "Home");
            // Captcha flag flag used to make sure Captcha is not redisplayed after being answered correctly
            Session["Captcha"] = "true";
            return View();
        }

        [HttpPost]
        public ActionResult Register(RegisterVM viewModel)
        {
            if (Session["Captcha"] == null) return RedirectToAction("Register");
            // if the Captcha flag is set, validate ReCaptcha
            if ((string)Session["Captcha"] == "true")
            {
                if (ReCaptcha.Validate("6Lf90SITAAAAABtHGCSZtgDMvxRSG3daNYFjiN7B"))
                {
                    Session["Captcha"] = "false";
                }
                else ViewBag.Captcha = "Incorrect. Please try again.<br /><br />";
            }
            // check user completed all required fields
            if (ModelState.IsValid)
            {
                // check if user selected an existing username
                if (userManager.FindByName(viewModel.UserName) == null)
                    // if everything checks out, redirect to Thankyou to create user and display message
                    return RedirectToAction("Thankyou", viewModel);
                else ViewBag.Message = "Username already taken.  Please choose a different username.";
            }           
            return View(viewModel);
        }
        // called internally by Register to create user and display message
        public ActionResult Thankyou(RegisterVM viewModel)
        {
            // create new user
            var user = new User
            {
                UserName = viewModel.UserName,
                Email = viewModel.Email,
                EmailConfirmed = false
            };
            var result = userManager.Create(user, viewModel.Password);

            // if user is successfully created, send the user an email to verify their email address
            if (result.Succeeded)
            {
                SendEmail(user);
            }
            return View();
        }
        // internal function sends email to passed user; used to send original and to resend verification email
        private void SendEmail(User user)
        {
            var verifyUrl = "http://www.darylpjones.com/Users/Verify/" + user.Id;
            try
            {
                using (var client = new SmtpClient())
                {
                    using (var message = new MailMessage())
                    {
                        message.From = (new MailAddress("noreply@mail.darylpjones.com", "Daryl P. Jones Portfolio"));
                        message.To.Add(user.Email);
                        message.Subject = "Please Verify your Account";
                        message.IsBodyHtml = true;
                        message.Body = "<p>Dear " + user.UserName + ", </p><p>To verify your e-mail address, please click the following link:</p>" +
                            "<p><a href=\"" + verifyUrl + "\" target=\"_blank\">" + verifyUrl + "</a><p>Thank you,<br />Daryl P. Jones Portfolio</p>";
                        client.Send(message);
                    }
                }
            }
            catch (Exception ex)
            {
                // writes exception to Output window
                Exception ex2 = ex;
                string errorMessage = string.Empty;
                while (ex2 != null)
                {
                    errorMessage += ex2.ToString();
                    ex2 = ex2.InnerException;
                }
                System.Diagnostics.Debug.Write(errorMessage);
            }
        }
        // AJAX called by Home/Index's Resend Link button (displays when unverified user tries to log in)
        public string ResendEmail()
        {
            if (Session["session"] == null && Session["user"] == null)
            {
                Session["session"] = true;
                return "Session";
            }
            if (Session["user"] == null) return "User";
            else
            {
                User user = (User)Session["user"];
                SendEmail(user);
                return "Sent";
            }
        }
        // checks if user is Authenticated
        public bool IsAuthenticated()
        {
            return User.Identity.IsAuthenticated;
        }
        
        // called when user clicks link in email
        public ActionResult Verify(string id)
        {
            if (string.IsNullOrEmpty(id))
            {
                ViewBag.Message = "There was a problem processing your request.";
            }

            else
            {
                var user = userManager.FindById(id);
                if (user != null)
                {
                    if (!user.EmailConfirmed)
                    {
                        user.EmailConfirmed = true;
                        userManager.UpdateAsync(user);
                        ViewBag.Message = "Your email address is now verified.  Thank you.";
                    }
                    else
                    {
                        ViewBag.Message = "Your email has already been verified.  Thank you.";
                    }
                }
                else ViewBag.Message = "There was a problem processing your request.";
            }
            return View();
        }
        // AJAX called by User Authentication form to asynchronously check credentials
        public string LoginUser(string username, string password)
        {
            var user = userManager.Find(username, password);
            if (user != null)
            {
                if (user.EmailConfirmed == false)
                {
                    Session["user"] = user;
                    return "unverified";
                }
                var identity = userManager.CreateIdentity(
                    user, DefaultAuthenticationTypes.ApplicationCookie);

                GetAuthenticationManager().SignIn(identity);
                return "true";
            }
            else return "false";
        }
        private void SignIn(User user)
        {
            var identity = userManager.CreateIdentity(user, DefaultAuthenticationTypes.ApplicationCookie);
            GetAuthenticationManager().SignIn(identity);
        }
        private IAuthenticationManager GetAuthenticationManager()
        {
            var ctx = Request.GetOwinContext();
            return ctx.Authentication;
        }
        // AJAX called by Home/Index's Logout button
        public bool Logout()
        {
            var ctx = Request.GetOwinContext();
            var authManager = ctx.Authentication;
            authManager.SignOut("ApplicationCookie");
            return true;
        }
        // AJAX called to initialize Entity Framework after Home/Index is displayed
        public string InitializeEF()
        {
            User user = userManager.Find("user1", "Password1");
            return user.UserName;
        }
        protected override void Dispose(bool disposing)
        {
            base.Dispose(disposing);
        }
    }
}
