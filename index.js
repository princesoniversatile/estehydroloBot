const fs = require('fs')
const express = require('express')
const venom = require('venom-bot')
const cors = require('cors')
const app = express()
const path = require('path');

// Serve static files from the 'public' directory
const port = process.env.PORT || 4001
app.use(cors())
let isQrScanned = false
app.use(express.static(path.join(__dirname, 'public')));
function saveQRImage (base64Qr) {
  const matches = base64Qr.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)

  if (matches.length !== 3) {
    throw new Error('Invalid input string')
  }

  const response = {
    type: matches[1],
    data: Buffer.from(matches[2], 'base64')
  }

  // Write the image data to a PNG file named 'out.png'
  fs.writeFile('out.png', response.data, 'base64', function (err) {
    if (err != null) {
      console.log(err)
    } else {
      console.log('QR code saved as out.png')
    }
  })
}


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
// API endpoint to serve the 'out.png' file
app.get('/qrimage', (req, res) => {
  const imagePath = `${__dirname}/out.png`

  fs.readFile(imagePath, (err, data) => {
    if (err) {
      console.error(err)
      res.status(500).send('Internal Server Error')
    } else {
      res.writeHead(200, { 'Content-Type': 'image/png' })
      res.end(data)
    }
  })
})

// Endpoint to set the connection status after scanning the QR code
app.get('/check-status', (req, res) => {
  res.json({ connected: isQrScanned })
})

// Endpoint to handle the QR code scan event
app.get('/qr-scanned', (req, res) => {
  isQrScanned = true
  res.send('QR code scanned successfully!')
})

//our pre-Build Functionality
let sessionLogin = '0'
let clientInstance = null
function dateLog (text) {
  console.log(new Date(), ' - ', text)
}
const officeAccount = 'office-account'
const estehydrolo='este-hydrolo'
// Endpoint to generate and retrieve the QR code

async function startClient () {
  let lastCommand = ''

  dateLog('Starting bot...')
  try {
    const client = await venom.create(
      { session: estehydrolo },
      base64Qr => {
        // Write the QR code as a PNG file
        saveQRImage(base64Qr) 
      },
      undefined,
      { logQR: true } // Ensure logQR is set to true to get ASCII QR
    ) // Replace 'session-name' with your actual session

    clientInstance = client
    dateLog('Bot started.')
    // Your message handling logic and other functionalities here...
    client.onMessage(async message => {
      // Handle incoming messages here
      //handlereply(client, message,lastCommand)
      dateLog(`Received message from ${message.from}: ${message.body}`)
      // Handle messages as needed...

      //code begins here
      try {
        const content =
          typeof message.body === 'string'
            ? message.body.toLowerCase()
            : message.body

        if (content === '!hi' && message.isGroupMsg === false) {
          sessionLogin = '1'
          lastCommand = content

          const introText =
            `*Hello there!* 👋\n` +
            `Welcome to *Este Hydrolo!!* \n\n` +
            `We're thrilled to have you here on our journey towards convenient services.\n` +
            `Let's explore together! `

          const afterIntroText = `Please Choose 👇 the options below\n`
          const commandsInfo =
            `1️⃣ Service Request\n` +
            `2️⃣ Installation Guide\n` +
            `3️⃣ Registration\n` +
            `4️⃣ Sales Enquiry`

          await client.startTyping(message.from)

          await client.sendText(message.from, introText)
          await client.startTyping(message.from)

          await client.sendText(message.from, afterIntroText + commandsInfo)
          if (sessionLogin === '1') { 
            setTimeout(async () => {
              await client.sendText(
                message.from,
                `*Session Expired* For Restart Again Type '!hi'`
              )
            }, 14 * 60 * 1000)
          }
        } else if (
          (content === '1' ||
            content === '2' ||
            content === '3' ||
            content === '4') &&
          lastCommand === '!hi'
        ) {
          let selectedCategory = ''
          let thankYouMessage = ''

          if (content === '1') {
            selectedCategory = 'Service Request'
            thankYouMessage = `Thank you for choosing our Service Request ! 🛒\nWe're ready to assist you! `
          } else if (content === '2') {
            selectedCategory = 'Installation Guide'
            thankYouMessage = `We appreciate your interest in our Installation Guide! 🔧\nYour convenience is our priority! `
          } else if (content === '3') {
            selectedCategory = 'Registration'
            thankYouMessage = `Thank you for registering with us! 📝\nWe're thrilled to have you on board! `
          } else if (content === '4') {
            selectedCategory = 'Sales Enquiry'
            thankYouMessage = `We're glad to assist you with your Sales Enquiry! 📞\nYour satisfaction is our goal! `
          }

          const categoryMessage = `👍 You've selected "${selectedCategory}"  \n`
          const tapOptionMessage = `To proceed with your *Booking Request*,\nTap 👇 below\n`
          // Add details for each category here...
          let categoryDetails = ''
          if (content === '1') {
            categoryDetails = `https://este.hydroloproducts.com/enquiry`
          } else if (content === '2') {
            categoryDetails = `https://este.hydroloproducts.com/enquiry/installation`
          } else if (content === '3') {
            categoryDetails = `https://este.hydroloproducts.com/enquiry/registration`
          } else if (content === '4') {
            categoryDetails = `https://este.hydroloproducts.com/contact-us`
          }
          const productList = categoryDetails
          await client.startTyping(message.from)
          await client.sendText(message.from, categoryMessage)
          await client.startTyping(message.from)

          await client.sendText(message.from, tapOptionMessage + productList)
          await client.startTyping(message.from)

          await client.sendText(message.from, thankYouMessage)
        } else if (content === '!qr') {
          await client.sendText(message.from, `this is working`)
        }
      } catch (error) {
        console.error('Error occurred:', error)
      }
    })
  } catch (error) {
    dateLog('Error occurred during bot start:', error)
  }
}

function restartClient () {
  dateLog('Restarting bot...')

  try {
    if (clientInstance) {
      sessionLogin = '0'
      clientInstance.close()
      clientInstance = null
    }
    dateLog('Bot closed. Restarting...')
    startClient()
  } catch (error) {
    dateLog('Error occurred during bot restart:', error)
  }
}

function setupRestartTimer () {
  // Set a restart timer for 20 minutes
  setInterval(restartClient, 15 * 60 * 1000) // Restart every 15 minutes
}

// Start the bot initially
startClient()
// Set up restart timer
setupRestartTimer()
app.use('/welcome', (req, res) => {
  res.status(404).send('<h1>Welcome To Este Hydrolo Server !!</h1>');
});

// Express server
app.listen(port, () => {
  dateLog(`Server is running on port ${port}`)
})
