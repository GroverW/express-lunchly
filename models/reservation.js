/** Reservation for Lunchly */

const moment = require("moment");

const db = require("../db");


/** A reservation for a party */

class Reservation {
  constructor({
    id,
    customerId,
    numGuests,
    startAt,
    notes
  }) {
    this.id = id;
    this._customerId;
    this.customerId = customerId;
    this._numGuests;
    this.numGuests = numGuests;
    this._startAt;
    this.startAt = startAt;
    this.notes = notes;
  }

  /** get number of guests */
  get numGuests() {
    return this._numGuests;
  }

  /** set number of guests */
  set numGuests(val) {
    if (val <= 0) {
      throw new Error("Please enter at least one guest.")
    }
    this._numGuests = val;
  }

  /** get startAt time */
  get startAt() {
    return this._startAt;
  }

  set startAt(dateTime) {
    if (!Date.parse(dateTime)) {
      throw new Error("Please enter a valid date");
    } else {
      this._startAt = dateTime;
    }
  }

  get customerId() {
    return this._customerId;
  }

  set customerId(id) {
    if (this._customerId) {
      throw new Error("This reservation already has a customer id.")
    } else {
      this._customerId = id;
    }
  }

  /** formatter for startAt */

  getformattedStartAt() {
    return moment(this.startAt).format('MMMM Do YYYY, h:mm a');
  }

  /** given a customer id, find their reservations. */

  static async getReservationsForCustomer(customerId) {
    const results = await db.query(
      `SELECT id, 
           customer_id AS "customerId", 
           num_guests AS "numGuests", 
           start_at AS "startAt", 
           notes AS "notes"
         FROM reservations 
         WHERE customer_id = $1
         ORDER BY start_At DESC`,
      [customerId]
    );

    return results.rows.map(row => new Reservation(row));
  }

  /** save new reservation or update to existing reservation */

  async save() {
    let results;

    if (this.id) {
      results = await db.query(
        `UPDATE reservations
        SET num_guests=$1, start_at=$2, notes=$3
        WHERE id = $4
        RETURNING id, customer_id AS "customerId", num_guests AS "numGuests", start_at AS "startAt", notes`,
        [this._numGuests, this._startAt, this.notes, this.id]
      );
    } else {
      results = await db.query(
        `INSERT INTO reservations
        (customer_id, num_guests, start_at, notes)
        VALUES ($1, $2, $3, $4)
        RETURNING id, customer_id AS "customerId", num_guests AS "numGuests", start_at AS "startAt", notes`,
        [this._customerId, this._numGuests, this._startAt, this.notes]
      );
    }

    return results.rows.map(row => new Reservation(row))[0];
  }


}


module.exports = Reservation;