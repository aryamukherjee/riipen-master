var elasticsearch = require('elasticsearch');

var esclient = new elasticsearch.Client({
  host: 'localhost:9200'
});

module.exports = function(app, redis, conn) {

    // get all portals
    app.get('/api/allportals', function(req, res) {
        var allPortals = [];
        esclient.search({  
            index: 'portals',
            type: 'portal',
            scroll: '30s',
            body: {
                query: {
                  match_all : {}
                }
            }
          },function getAllPortals(error, response) {
                    console.dir(response);
                    response.hits.hits.forEach(function (hit) {
                    allPortals.push(hit);
                });
                
                if (response.hits.total > allPortals.length) {
                    // ask elasticsearch for the next set of hits from this search
                    esclient.scroll({
                      scrollId: response._scroll_id,
                      scroll: '30s'
                    }, getAllPortals);
                } 
                else 
                {
                  res.json(allPortals);
                }
          });
    });
    
    //get by searched text(with fuzziness and boosting)
    app.get('/api/getmatchedportals', function(req, res) {
        var allPortals = [];
        esclient.search({  
            index: 'portals',
            type: 'portal',
            scroll: '30s',
            body: {
                query: {
                    multi_match : {
                        "query" : req.query.text,
                        "fields" : [ 
                            "name^2"
                        ],
                        "fuzziness" : "AUTO",
                        "prefix_length" : 2
                    }
                },
            }
          },function getAllPortals(error, response) {
                    console.dir(response);
                    response.hits.hits.forEach(function (hit) {
                    allPortals.push(hit);
                });
                
                if (response.hits.total > allPortals.length) {
                    // ask elasticsearch for the next set of hits from this search
                    esclient.scroll({
                      scrollId: response._scroll_id,
                      scroll: '30s'
                    }, getAllPortals);
                } 
                else 
                {
                  res.json(allPortals);
                }
          });
          
          // log what being searched by whom in the database asynchronously(email is taken as if it is taken from cookies or server session)
            var data  = {username: 'aryam@mail.usf.edu', search_string: req.query.text, type: 'portals'};
            var query = conn.query('INSERT INTO user_session_data SET ?', data, function (error, results, fields) {
              if (error) throw error;
              // Neat!
            });
            console.log(query.sql);
    });
    
    // get all recommended assignments
    app.get('/api/recommendations', function(req, res) {
        var allAssigns = [];
        esclient.search({  
            index: 'tags_nested_objs',
            type: 'assignments',
            scroll: '30s',
            body: {
                query: {
                  bool: {
                    must: [
                      { match: { "tag_ids.tag_id":  req.query.tag_id }},
                      { match: { "location_id":  req.query.location_id }},
                      { match: { "tag_ids.type":  "skills" }} 
                    ]
                  }
                }
            }
          },function getAllAssigns(error, response) {
                    console.dir(response);
                    response.hits.hits.forEach(function (hit) {
                    allAssigns.push(hit);
                });
                
                if (response.hits.total > allAssigns.length) {
                    // ask elasticsearch for the next set of hits from this search
                    esclient.scroll({
                      scrollId: response._scroll_id,
                      scroll: '30s'
                    }, getAllAssigns);
                } 
                else 
                {
                  res.json(allAssigns);
                  cacheRecAssignToRedis(allAssigns);
                }
          });
    });
    
    //get by searched text(with fuzziness and boosting)
    app.get('/api/getmatchedassignments', function(req, res) {
        var allAssigns = [];
        esclient.search({  
            index: 'tags_nested_objs',
            type: 'assignments',
            scroll: '30s',
            body: {
                query: {
                    multi_match : {
                        "query" : req.query.text,
                        "fields" : [ 
                            "name^2", 
                            "summary^1.5" 
                        ],
                        "fuzziness" : "AUTO",
                        "prefix_length" : 2
                    }
                },
            }
          },function getAllAssigns(error, response) {
                    console.dir(response);
                    response.hits.hits.forEach(function (hit) {
                    allAssigns.push(hit);
                });
                
                if (response.hits.total > allAssigns.length) {
                    // ask elasticsearch for the next set of hits from this search
                    esclient.scroll({
                      scrollId: response._scroll_id,
                      scroll: '30s'
                    }, getAllAssigns);
                } 
                else 
                {
                  res.json(allAssigns);
                  cacheMatchedAssignToRedis(allAssigns);
                }
          });
          
          // log what being searched by whom in the database asynchronously(email is taken as if it is taken from cookies or server session)
            var data  = {username: 'aryam@mail.usf.edu', search_string: req.query.text, type: 'assignments'};
            var query = conn.query('INSERT INTO user_session_data SET ?', data, function (error, results, fields) {
              if (error) throw error;
              // Neat!
            });
            console.log(query.sql);
    });
    
    //get by tag id 505
    app.get('/api/getbytag', function(req, res) {
        var allAssigns = [];
        esclient.search({  
            index: 'tags_nested_objs',
            type: 'assignments',
            scroll: '30s',
            body: {
                query: {
                  bool: {
                    must: [
                      { match: { "tag_ids.tag_id":  req.query.tag_id }} 
                    ]
                  }
                }
            }
          },function getAllAssigns(error, response) {
                    console.dir(response);
                    response.hits.hits.forEach(function (hit) {
                    allAssigns.push(hit);
                });
                
                if (response.hits.total > allAssigns.length) {
                    // ask elasticsearch for the next set of hits from this search
                    esclient.scroll({
                      scrollId: response._scroll_id,
                      scroll: '30s'
                    }, getAllAssigns);
                } 
                else 
                {
                  res.json(allAssigns);
                }
          });
    });

    app.get('/api/getassignment', getRecAssignFromCache, getRecAssignFromDatabase);
    
    function getRecAssignFromCache(req, res, next) {

        redis.hgetall("aryam@mail.usf.edu"+req.query._id, function (err, obj) {
            if(err)
            {
                console.log(err);
            }
            if(obj != null)
            {
                res.json(obj);
                console.log('Fetched from cache.');
            }
            else
            {
                next();
            }
        });
    }
    function getRecAssignFromDatabase(req, res, next) {
            conn.query('SELECT name, summary, deliverables, start_date, end_date FROM assignments WHERE id = ?', [req.query._id], function (error, results) {
            if (error)
            {
                console.log(error);
            }
            else
            {
                res.json(results[0]);
                console.log('Fetched from DB.');
            }
        })
    }
    
    function cacheRecAssignToRedis(obj)
    {
        console.log('OBJ: '+obj);
        for( var i=0; i<obj.length; i++)
        {
            conn.query('SELECT id, name, summary, deliverables, start_date, end_date FROM assignments WHERE id = ?', [obj[i]._id], function (error, results) {
            if (error)
            {
                console.log(error);
            }
            console.log(results);
            redis.hmset("aryam@mail.usf.edu"+results[0].id, 
            ["name", results[0].name, "summary", results[0].summary, "deliverables", results[0].deliverables, "start_date", results[0].start_date, "end_date", results[0].end_date], 
            function(err){
               if(err)
               {
                   console.log(err);
               } 
            });
          });
           
        } 
    }
    function cacheMatchedAssignToRedis(obj)
    {
        console.log('OBJ: '+obj);
        //cache only top 20 assignments
        //elastic search returns the results according to descending order of TF/IDF score
        for( var i=0; i<20; i++)
        {
            conn.query('SELECT id, name, summary, deliverables, start_date, end_date FROM assignments WHERE id = ?', [obj[i]._id], function (error, results) {
            if (error)
            {
                console.log(error);
            }
            console.log(results);
            redis.hmset("aryam@mail.usf.edu"+results[0].id, 
            ["name", results[0].name, "summary", results[0].summary, "deliverables", results[0].deliverables, "start_date", results[0].start_date, "end_date", results[0].end_date], 
            function(err){
               if(err)
               {
                   console.log(err);
               } 
            });
          });
           
        } 
    }
}