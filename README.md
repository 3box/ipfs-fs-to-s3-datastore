# ipfs-fs-to-s3-datastore

[![Greenkeeper badge](https://badges.greenkeeper.io/3box/ipfs-fs-to-s3-datastore.svg)](https://greenkeeper.io/)

Transfer data from an IPFS js fs datastore to a S3 datastore. Maps structure from one datastore to another and syncs to S3 bucket.

```
$ npm i ipfs-fs-to-s3-datastore
```
Run command to copy IPFS datastore data from source directory (arg 1) to S3 bucket and path (arg 2)

```
$ ipfs-datastore-copy ./ipfs s3://your-ipfs-bucket/ipfs
```
