'use strict';
//DB promisifying proto
//all the data function now belong to DB_Bucket

var Couchbase = require("couchbase");
var DB_Bucket = require("./DB_Bucket");
var Promise = require("bluebird");
var _ = require("lodash");
var Error = require("../Error/CBirdError");

function DB_Face() {
    this.initiated = false;
    return this;
}

DB_Face.prototype.init = function (params) {
    var opts = {
        server_ip: "127.0.0.1",
        n1ql: "127.0.0.1:8093"
    };
    _.assign(opts, params);
    this.initiated = true;
    this._server_ip = opts.server_ip;
    this._n1ql = opts.n1ql;
    this._cluster = new Couchbase.Cluster(this._server_ip);
    this._buckets = {};

    //just to incapsulate it here
    this.ViewQuery = Couchbase.ViewQuery;
    this.N1qlQuery = Couchbase.N1qlQuery;
    return this;
}


//CONNECTION
DB_Face.prototype.bucket = function (bucket_name) {
    if (this._buckets[bucket_name]) {
        return this._buckets[bucket_name];
    }
    this._buckets[bucket_name] = new DB_Bucket(this._cluster, bucket_name, {
        n1ql: this._n1ql
    });
    return this._buckets[bucket_name];
}

//should not be used. In fact, calling disconnect on the bucket directly may result in segfault
//bucket autoreconnects in configurable interval, so we don't need to manage connection
//so it seems to be the right way just "to keep or not to keep" the bucket reference in _buckets pool
DB_Face.prototype._disconnect = function (bucket_name) {
    if (!this._buckets[bucket_name]) {
        return;
    }
    delete this._buckets[bucket_name];
}


module.exports = DB_Face;