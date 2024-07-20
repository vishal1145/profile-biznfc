var biznfcApp = angular.module("biznfcApp", []);

biznfcApp.controller('biznfcController', function ($scope, $http, $location) {
    $scope.name = "Rahul Rishikesh";

    var testCardUrl = "36YF0JglmYarbOaerROs";

    function getCardIdFromUrl() {
        try {
            var path = $location.absUrl().split('/cards/')[1];
            return path ? path : testCardUrl;
        }catch(err) {
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
                } else {
                    console.error('API response unsuccessful:', response.data);
                }
            }, function (error) {
                console.error('Error occurred:', error);
            });
    } else {
        console.error('Card ID is missing.');
    }

    $scope.shareOnWhatsApp = function () {
        if (cardId) {
            const message = `Check out this Biznfc card: https://biznfc.algofolks.com/cards/${cardId}`;
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        } else {
            console.error('Card ID is missing.');
        }
    };
});
