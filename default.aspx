<%@ Page Language="C#" %>

    <!DOCTYPE html>

    <html xmlns="http://www.w3.org/1999/xhtml">

    <head runat="server">
        <title>Este Hydrolo Bot</title>
        <link rel="icon" href="este-logo-hydrolo-min.jpg" type="image/png">
        <style>
            /* CSS styles for better UI */
            body {
                font-family: Arial, sans-serif;
                text-align: center;
                background-color: #f3f3f3;
                margin: 0;
                padding: 0;
            }

            header {
                background-color: #333;
                color: white;
                padding: 10px 0;
                font-family: Palatino Linotype, Book Antiqua, Palatino, serif;
                text-align: center;
            }

            footer {
                background-color: #333;
                color: white;
                padding: 10px 0;
                position: fixed;
                bottom: 0;
                width: 100%;
                font-family: Verdana, Geneva, sans-serif;
                font-size: 14px;
                text-align: center;
            }

            #content {
                padding-top: 50px;
                /* Adjust the padding for content */
            }
            #content h4{font-family: Arial, Helvetica, sans-serif;}


            #loadingAnimation {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                margin-top: 150px;
                font-size: 24px;
                font-weight: bold;
            }

            #qrCodeContainer {
                display: none;
                margin-top: 20px;
                border: 2px solid green;
                border-radius: 10px;
                padding: 10px;
            }

            #statusContainer {
                margin-top: 20px;
                font-size: 21px;
                padding: 10px;
                font-weight: bold;
                color: green;
            }

            #connectMessage {
                font-size: 18px;
                color: red;
                margin-top: 10px;
            }
        </style>
    </head>

   

    <body>
        <form id="form1" runat="server">
            <header>
                <h1>Este Hydrolo Bot Status</h1>
            </header>

            <div id="content">
                <div id="loadingAnimation">
                    <!-- Loading animation content -->
                    Connecting...
                </div>
                <h4 id="refreshMessage"></h4>

                <div id="qrCodeContainer">
                    <!-- QR code image will be displayed here -->
                </div>

                <div id="statusContainer">
                    <!-- Connection status will be displayed here -->
                </div>

                <div id="connectMessage" style="display: none;">
                    Scan to connect your bot if it's not connected.
                </div>
            </div>

            <footer>
                <p>Powered by Versatile Prime Infosoft Pvt. Ltd. | ISO 9001:2008 CERTIFIED COMPANY </p>
            </footer>
        </form>
        <script>
            function showLoadingAnimation() {
                document.getElementById('loadingAnimation').style.display = 'block';
            }

            function hideLoadingAnimation() {
                document.getElementById('loadingAnimation').style.display = 'none';
            }
            function updateRefreshMessage() {
            var refreshMessage = document.getElementById("refreshMessage");
            refreshMessage.innerHTML = `Please refresh the page, If you're facing trouble to scan.`;
        }

            function fetchAndDisplayQRCode() {
                showLoadingAnimation();

                fetch('http://192.168.1.11:9001/qrimage')
                    .then(response => response.blob())
                    .then(blob => {
                        const qrCodeContainer = document.getElementById('qrCodeContainer');
                        const statusContainer = document.getElementById('statusContainer');
                        const connectMessage = document.getElementById('connectMessage');

                        hideLoadingAnimation();
                        qrCodeContainer.style.display = 'block';

                        // Create an image element and set its source to the retrieved QR code
                        const img = document.createElement('img');
                        img.src = URL.createObjectURL(blob);
                        img.alt = 'QR Code';

                        // Clear the container and append the image
                        qrCodeContainer.innerHTML = '';
                        qrCodeContainer.appendChild(img);

                        statusContainer.innerText = 'Connected';
                    })
                    .catch(error => {
                        hideLoadingAnimation();
                        console.error('Error fetching QR code:', error);
                        // Display an error message or handle the error as needed
                    });
            }

            function checkConnectionStatus() {
                fetch('http://192.168.1.11:9001/check-status')
                    .then(response => response.json())
                    .then(data => {
                        const statusContainer = document.getElementById('statusContainer');
                        const connectMessage = document.getElementById('connectMessage');

                        if (!data.connected) {
                            statusContainer.innerText = 'Not Connected';
                            connectMessage.style.display = 'block'; // Display the connect message
                        } else {
                            connectMessage.style.display = 'none'; // Hide the connect message
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching connection status:', error);
                        // Display an error message or handle the error as needed
                    });
            }

            // Fetch and display the QR code when the page loads
            showLoadingAnimation();
            setTimeout(fetchAndDisplayQRCode, 2000); // Simulate a delay for loading animation
            setTimeout(updateRefreshMessage, 4500);

            // Check connection status every 5 seconds
            setInterval(checkConnectionStatus, 5000);

            // Function to mark QR code as scanned
            function markQRScanned() {
                fetch('http://192.168.1.11:3003/qr-scanned')
                    .then(response => {
                        if (response.ok) {
                            console.log('QR code marked as scanned');
                            // Optionally, perform additional actions after marking the QR as scanned
                        } else {
                            console.error('Failed to mark QR code as scanned');
                            // Handle the failure if needed
                        }
                    })
                    .catch(error => {
                        console.error('Error marking QR code as scanned:', error);
                        // Handle the error if needed
                    });
            }

            // Automatically mark QR code as scanned after 10 seconds
            setTimeout(markQRScanned, 10000);
        </script>
    </body>

    </html>