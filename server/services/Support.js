const fs = require("fs"),
  path = require("path")

const supportFiles = ["incident_contact_list", "silence_templates"]
const data = {}

const loadData = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath))
  } catch (e) {
    throw e
  }
}

/** Helper for watchFile, also handling symlinks */
function watchFile(path, callback) {

  if (fs.existsSync(path)) {
    // Check if it's a link
    fs.lstat(path, function(err, stats) {
        if(err) {
            // Handle errors
            return callback(err)
        } else if(stats.isSymbolicLink()) {
            // Read symlink
            fs.readlink(path, function(err, realPath) {
                console.log("---- readlink")
                // Handle errors
                if(err) return callback(err)
                // Watch the real file if it exists
                if (fs.existsSync(realPath)) {
                  fs.watch(realPath, callback)
                }
            });
        } else {
            console.log("watch")
            // It's not a symlink, just watch it
            fs.watch(path, callback)
        }
    })
  } else {
    setTimeout(watchFile(path, callback), 5000);
  }
}

supportFiles.forEach((file) => {
  const filePath = path.join(
    __dirname,
    `/../../config/support/${file}.json${
      process.env.NODE_ENV === "test" ? ".sample" : ""
    }`
  )

  watchFile(filePath, (event, _) => {
    if (event === "change") {
      console.log("+++ SUPPORT FILE CHANGE:", filePath, ". Reloading!!");
      data[file] = loadData(filePath)
    }
  })

  if (fs.existsSync(filePath)) {
    data[file] = loadData(filePath)
  }
})

const Support = {
  getContacts: async () => data["incident_contact_list"],
  getSilenceTemplates: async () => data["silence_templates"],
}

module.exports = Support
