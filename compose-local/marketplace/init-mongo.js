/*
  Setup for Marketplace MongoDB databases and users
*/
print('##### Setting up MongoDB #####');

// Charging
db = db.getSiblingDB('charging_db');
db.createUser(
    {
	user: "charging",
	pwd: "charging_pw",
	roles: [
	    {
		role: "readWrite",
		db: "charging_db"
	    }
	]
    }
);

// proxy
db = db.getSiblingDB('belp_db');
db.createUser(
    {
	user: "belp",
	pwd: "belp_pw",
	roles: [
	    {
		role: "readWrite",
		db: "belp_db"
	    }
	]
    }
);

