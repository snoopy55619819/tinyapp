const { assert } = require('chai');

const { getUserByEmail } = require('../helpers/userURLDatabaseHelpers');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert.deepEqual(user, expectedUserID);
  });
  it('should return null/undefined with a valid email, but email not in database', function() {
    const user = getUserByEmail("user3@example.com", testUsers)
    const expectedUserID = null;
    // Write your assert statement here
    assert.deepEqual(user, expectedUserID);
  });
  it('should return null/undefined with a blank email', function() {
    const user = getUserByEmail("", testUsers)
    const expectedUserID = null;
    // Write your assert statement here
    assert.deepEqual(user, expectedUserID);
  });
});