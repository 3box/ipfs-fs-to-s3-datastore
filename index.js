#!/usr/bin/env node

const [,, ...args] = process.argv

if (args.length !==  2) throw new Error('Need two args, source ipfs datastore folder, and destination S3 bucket')

const { readdirSync, statSync } = require('fs')
const fse = require('fs-extra')
const { join } = require('path')
const { exec, spawn } = require('child_process');

const path = args[0]
const s3Bucket = args[1]

// get array of directory names
const dirNames = p => readdirSync(p).filter(f => statSync(join(p, f)).isDirectory())

// get array of directory and file names
const fileNames = p => readdirSync(p)

// temp dir of transformed data
const TEMP_DIR_PATH = './__temp_copy'

const copyAndTransformBlocks = (path) => {
  const blocksPath = join(path, 'blocks')
  const blocksCopyPath = join(TEMP_DIR_PATH, 'blocks')
  const blockDirs = dirNames(blocksPath)
  blockDirs.forEach(dir => {
    const files = fileNames(join(blocksPath, dir))
    files.forEach(file => {
      // remove .data from end
      const copyFileName = file.slice(0,-5)
      fse.copySync(join(blocksPath, dir, file), join(blocksCopyPath, copyFileName))
    })
  })
}

const copyAndTransform = (path) => {
  const files = fileNames(path).filter(v => v !== 'blocks')
  files.forEach(file => {
    fse.copySync(join(path, file), join(TEMP_DIR_PATH, file))
  })
  copyAndTransformBlocks(path)
}

const awsSync = (bucketName, cb) => {
  const child = spawn('aws', ['s3', 'sync', TEMP_DIR_PATH, bucketName])
  child.on('close', (code) => {
    console.log('AWS Sync process exited with code ' + code);
    cb()
  })
  child.stdout.on('data', (data) => {
    if (data.indexOf('Completed') === -1) {
      console.log('stdout: ' + data)
    }
  })
}

const cleanup = () => {
  fse.removeSync(TEMP_DIR_PATH)
}

const run = (path, bucketName) => {
  console.log(`Running data transformation on directory ${path} ...`)
  copyAndTransform(path)
  console.log('Data transformation complete.')
  console.log(`Syncing to S3 bucket ${bucketName} ...`)
  awsSync(bucketName, () => {
    console.log('Sync Complete.')
    cleanup()
  })
}

run(path, s3Bucket)
