module.exports = {
  ensureAuthenticated: function(role) {
    return function(req, res, next) {
      // Ensure that user is logged in correctly
      if (!req.isAuthenticated()) {
        return res.redirect("/login");
      }

      return next();
    };
  }
};
