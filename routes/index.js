
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express app with Jade view deployed on AWS Elastic Beanstalk' });
};
