let express = require("express");
let db = require("./database.js");
// Needed for allowing HTTP_HEADER: ALLOW FROM ORIGIN.
let cors = require('cors');
let server = express();
server.use(cors());

// Server port.
const PORT = process.env.PORT || 3000;

// Start server.
server.connection = server.listen(PORT, () => {
    if(server.settings.env !== 'test') {
        console.log("Server running on port %PORT%".replace("%PORT%",PORT))
    }
});

// Root endpoint.
server.get("/", (req, res) => {
    res.json({"message":"Ok"})
});

server.get("/api/athletes", (req, res) => {
    const page_number = req.query.page_number || 1;
    const page_size = req.query.page_size || 10;
    const sql = "SELECT g.game_id as game_id, g.city as city, g.year as year, " +
        "ar.athlete_id as athlete_id, (ar.gold * 5 + ar.silver * 3 + ar.bronze * 1) as score, " +
        "a.name as name, a.surname as surname, ap.photo as photo, ap.mime_type as mime_type " +
        "FROM Game as g " +
        "INNER JOIN AthleteResult as ar ON ar.game_id = g.game_id " +
        "INNER JOIN Athlete as a ON a.athlete_id = ar.athlete_id " +
        "INNER JOIN AthletePhoto as ap ON ap.photo_id = a.photo_id " +
        "ORDER BY year DESC, score DESC ";
    const params = [];
    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({"error":err.message});
            return;
        }
        /*
            Reduce to associative array where appears game occurrences with athletes that have participated in.
            CHECK: Images are parsed to base64 since I consider anti-pattern to deal with Binary Images on API.
         */
        const groupByGame = rows.reduce((acc, item) => {
            const new_athlete = {
                id: item.athlete_id,
                name: item.name,
                surname: item.surname,
                score: item.score,
                photo: 'data:image/' + item.mime_type + ';base64,' + item.photo.toString('base64')
            };
            if(!acc[item.year]) {
                acc[item.year] = {
                    id: item.game_id,
                    city: item.city,
                    year: item.year,
                    athletes: [new_athlete]
                }
            } else {
                acc[item.year].athletes.push(new_athlete);
            }
            return acc;
        }, {});
        // Retrieves Collection sorted by Year ASC + Page Number with required size.
        const paginatedCollection = Object.values(groupByGame).reverse();
        const slicedCollection = paginatedCollection.slice((page_number - 1) * page_size, page_number * page_size);
        const lastPageNumber = Math.ceil(paginatedCollection.length/page_size);
        res.json({
            "message": "success",
            "data": slicedCollection,
            "last_page_number": lastPageNumber
        })
    });
});

server.get("/api/athletes/:id", (req, res) => {
    const id = req.params.id;
    const sql = "SELECT city, year, gold, silver, bronze, name, surname, weight, height, date_of_birth, photo, mime_type, bio " +
        "FROM AthleteResult as ar " +
        "INNER JOIN Game as g on g.game_id = ar.game_id " +
        "INNER JOIN Athlete as a on a.athlete_id = ar.athlete_id " +
        "INNER JOIN AthletePhoto as ap on ap.photo_id = a.photo_id " +
        "WHERE ar.athlete_id = ?";
    db.all(sql, id, (err, rows) => {
        if (err) {
            res.status(400).json({"error":err.message});
            return;
        }
        let groupByGames = {};
        /*
            If It has at least one game instance, It could be changed regarding requirements.
            Would We like to show an athlete that does not have any game occurrence?
            CHECK: Images are parsed to base64 since I consider anti-pattern to deal with Binary Images on API.
         */
        if(rows.length > 0) {
            const firstGame = rows[0];
            groupByGames = {
                name: firstGame.name,
                surname: firstGame.surname,
                weight: firstGame.weight,
                height: firstGame.height,
                date_of_birth: firstGame.date_of_birth,
                photo: 'data:image/' + firstGame.mime_type + ';base64,' + firstGame.photo.toString('base64'),
                bio: firstGame.bio,
                games: []
            };
            rows.forEach((item) => {
                groupByGames.games.push({
                    city: item.city,
                    year: item.year,
                    gold: item.gold,
                    silver: item.silver,
                    bronze: item.bronze
                })
            });
        }
        res.json({
            "message":"success",
            "data": groupByGames
        })
    });
});

// Default response for any other request.
server.use(function(req, res){
    res.status(404).json({"message":'Resource not found'});
});

module.exports = server;