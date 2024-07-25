var biznfcApp = angular.module("biznfcApp", []);

biznfcApp.controller('biznfcController', function ($scope, $http, $location) {
    $scope.name = "Rahul Rishikesh";

    var testCardUrl = "36YF0JglmYarbOaerROs";

    function getCardIdFromUrl() {
        try {
            var path = $location.absUrl().split('/cards/')[1];
            return path ? path : testCardUrl;
        } catch (err) {
            return testCardUrl;
        }
    }

    var cardId = getCardIdFromUrl();
    var requestData = {
        "url": cardId
    };

    if (requestData.url) {
        $http.post('https://biznfc.net/getCardByUrl', requestData)
            .then(function (response) {
                if (response.data.success) {
                    $scope.cardDetails = response.data.results[0];
                    var cardId = $scope.cardDetails.cardId;
                    console.log("cardId", cardId);
                    if (cardId) {
                        getAllItemByCardId(cardId);
                    }
                } else {
                    console.error('API response unsuccessful:', response.data);
                }
            }, function (error) {
                console.error('Error occurred:', error);
            });
    } else {
        console.error('Card ID is missing.');
    }

    function getAllItemByCardId(cardId) {
        var payload = {
            cardId: cardId
        };
        $http.post('https://biznfc.net/getAllItemByCardId', payload)
            .then(function (response) {
                if (response.data.success) {
                    $scope.items = response.data.results;
                    console.log('Items:', $scope.items);
                    $scope.items.forEach(function(item) {
                        if (!item.value.startsWith('http://') && !item.value.startsWith('https://')) {
                            item.value = 'http://' + item.value;
                        }
                    });
                } else {
                    console.error('API response unsuccessful:', response.data);
                }
            }, function (error) {
                console.error('Error occurred:', error);
            });
    }

    $scope.shareCard = function () {
        if (cardId) {
            const message = `Check out this Biznfc card: https://biznfc.algofolks.com/cards/${cardId}`;
            
            if (navigator.share) {
                navigator.share({
                    title: 'Biznfc Card',
                    text: message,
                    url: `https://biznfc.algofolks.com/cards/${cardId}`
                }).then(() => {
                    console.log('Thanks for sharing!');
                }).catch(err => {
                    console.error('Error sharing:', err);
                });
            } else {
                console.log('Native sharing not supported. Using fallback.');
                $scope.fallbackShare(message);
            }
        } else {
            console.error('Card ID is missing.');
        }
    };

    $scope.fallbackShare = function (message) {
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    $scope.downloadTextFile = function () {
        if (requestData.url) {
            $http.post('https://biznfc.net/getCardByUrl', requestData)
                .then(function (response) {
                    if (response.data.success) {
                        $scope.cardDetails = response.data.results[0];
                        var cardId = $scope.cardDetails.cardId;
                        console.log("cardId111", $scope.cardDetails);
    
                        // Define variables within the callback
                        var mobileNo = $scope.cardDetails.cardMobileNo || '';
                        var cardName = $scope.cardDetails.fullName || 'Biznfc';
                        var designation = $scope.cardDetails.designation || '';
                        var company = $scope.cardDetails.organization || '';
                        var website = $scope.cardDetails.webValue || '';
                        var email = $scope.cardDetails.emailValue || '';
                        var currentDate = new Date();
                        var formattedDate = currentDate.toISOString().split('T')[0];
    
                        // Only call getAllItemByCardId if needed, otherwise comment out or remove
                        if (cardId) {
                            getAllItemByCardId(cardId);
                        }
    
                        // Create the vCard text content
                        const textContent = 
`BEGIN:VCARD
VERSION:3.0
N:${cardName};;;;
FN:${cardName}
TEL;TYPE=WORK:${mobileNo}
EMAIL:${email}
URL:${website}
URL:${$scope.cardDetails.shareUrl}
ORG:${company}
TITLE:${designation}
X-ABDATE:${formattedDate}
END:VCARD
`;
    
                        // Create a blob and download the file
                        const blob = new Blob([textContent], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${cardName}.vcf`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                    } else {
                        console.error('API response unsuccessful:', response.data);
                    }
                }, function (error) {
                    console.error('Error occurred:', error);
                });
        } else {
            console.error('Card ID is missing.');
        }
    };
    
});
