var biznfcApp = angular.module("biznfcApp", []);

biznfcApp.controller("biznfcController", function ($scope, $http, $location) {
  $scope.name = "Rahul Rishikesh";
  $scope.currentYear = new Date().getFullYear();

  var testCardUrl = "36YF0JglmYarbOaerROs";

  function getCardIdFromUrl() {
    try {
      var path = $location.absUrl().split("/cards/")[1];
      return path ? path : testCardUrl;
    } catch (err) {
      return testCardUrl;
    }
  }

  var cardId = getCardIdFromUrl();
  var requestData = {
    url: cardId,
  };

  if (requestData.url) {
    $http.post("https://biznfc.net/getCardByUrl", requestData).then(
      function (response) {
        if (response.data.success) {
          $scope.cardDetails = response.data.results[0];
          var cardId = $scope.cardDetails.cardId;
          console.log("cardId", cardId);
          if (cardId) {
            getAllItemByCardId(cardId);
            getIsVisible(cardId);
          }
        } else {
          console.error("API response unsuccessful:", response.data);
        }
      },
      function (error) {
        console.error("Error occurred:", error);
      }
    );
  } else {
    console.error("Card ID is missing.");
  }

  function getAllItemByCardId(cardId) {
    var payload = {
      cardId: cardId,
    };
    $http.post("https://biznfc.net/getAllItemByCardId", payload).then(
      function (response) {
        if (response.data.success) {
          $scope.items = response.data.results.filter(function (item) {
            return item.isVisibled === 1;
          });
          console.log("Filtered Items:", $scope.items);
        } else {
          console.error("API response unsuccessful:", response.data);
        }
      },
      function (error) {
        console.error("Error occurred:", error);
      }
    );
  }

  $scope.redirectTo = function (item) {
    const url = item.icon.preUrl + item.value;
    window.open(url, "_blank");
  };

  $scope.shareCard = function () {
    if (cardId) {
      const message = `Check out this Biznfc card: https://biznfc.algofolks.com/cards/${cardId}`;

      if (navigator.share) {
        navigator
          .share({
            title: "Biznfc Card",
            text: message,
            url: `https://biznfc.algofolks.com/cards/${cardId}`,
          })
          .then(() => {
            console.log("Thanks for sharing!");
          })
          .catch((err) => {
            console.error("Error sharing:", err);
          });
      } else {
        console.log("Native sharing not supported. Using fallback.");
        $scope.fallbackShare(message);
      }
    } else {
      console.error("Card ID is missing.");
    }
  };

  $scope.fallbackShare = function (message) {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  function getProfileItemByCardId(cardId) {
    var payload = { cardId: cardId };
  
    return $http
      .post("https://biznfc.net/getAllItemByCardId", payload)
      .then(function (response) {
        if (response.data.success) {
          var items = response.data.results;
  
          var emailItem = items.find((item) => item.displayName === "Email");
          var phoneItem = items.find((item) => item.displayName === "Phone");
          var websiteItem = items.find((item) => item.displayName === "Website");
  
          var email = emailItem
            ? emailItem.value.replace(/^https?:\/\//, "")
            : "";
          var phone = phoneItem
            ? phoneItem.value.replace(/^https?:\/\//, "")
            : "";
          var website = websiteItem
            ? websiteItem.value.replace(/^https?:\/\//, "")
            : "";
  
          return $http
            .post("https://biznfc.net/getCardById", { cardId: cardId })
            .then(function (secondResponse) {
              if (secondResponse.data.success) {
                var secondData = secondResponse.data.results[0];
                var photoBase64Url = secondData.photoBase64Url;
  
                return {
                  email,
                  phone,
                  website,
                  photoBase64Url,
                };
              } else {
                return Promise.reject(
                  "Error fetching card: " + secondResponse.data.message
                );
              }
            });
        } else {
          return Promise.reject(
            "Error fetching items: " + response.data.message
          );
        }
      })
      .catch(function (error) {
        console.error("HTTP request error:", error);
        return Promise.reject(error);
      });
  }  

  $scope.downloadTextFile = function () {
    if (requestData.url) {
      $http.post("https://biznfc.net/getCardByUrl", requestData).then(
        function (response) {
          if (response.data.success) {
            $scope.cardDetails = response.data.results[0];
            var cardId = $scope.cardDetails.cardId;

            var cardName = $scope.cardDetails.fullName || "Biznfc";
            var designation = $scope.cardDetails.designation || "";
            var company = $scope.cardDetails.organization || "";
            var currentDate = new Date();
            var formattedDate = currentDate.toISOString().split("T")[0];

            if (cardId) {
              getProfileItemByCardId(cardId)
                .then(function (profileItems) {
                  var email = profileItems.email;
                  var mobileNo = profileItems.phone;
                  var website = profileItems.website;
                  var photoBase64Url = profileItems.photoBase64Url;
                  $scope.getCurrentUrl = function () {
                    return $location.absUrl();
                  };

                  const textContent = `BEGIN:VCARD
VERSION:3.0
N;CHARSET=utf-8:${cardName};;;;
FN;CHARSET=utf-8:
TEL;TYPE=Work:${mobileNo}
EMAIL;INTERNET;TYPE=Email:${email}
URL;TYPE=Website:${website}
TEL;TYPE=Text:${mobileNo}
URL;TYPE=Biznfc - Digital Business Card:${$scope.getCurrentUrl()}
ORG;CHARSET=utf-8:${company}
TITLE;CHARSET=utf-8:${designation}
X-ABDATE;TYPE=Date connected via Biznfc:${formattedDate}
PHOTO;ENCODING=b;TYPE=JPEG:${photoBase64Url}
END:VCARD`;

                  // Create a blob and download the file
                  const blob = new Blob([textContent], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${cardName}.vcf`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                })
                .catch(function (error) {
                  console.error("Error fetching profile items:", error);
                });
            }
          } else {
            console.error("API response unsuccessful:", response.data);
          }
        },
        function (error) {
          console.error("Error occurred:", error);
        }
      );
    } else {
      console.error("Card ID is missing.");
    }
  };

  function getIsVisible(cardId) {
    $http.post("https://biznfc.net/getCardById", { cardId: cardId }).then(
      function (response) {
        if (response.data.success) {
          $scope.cardDetails = response.data.results[0];
          var cardId = $scope.cardDetails.cardId;
          $scope.isActive = $scope.cardDetails.isActive;
          console.log("isActive", isActive);
        } else {
          console.error("API response unsuccessful:", response.data);
        }
      },
      function (error) {
        console.error("Error occurred:", error);
      }
    );
  }

  $scope.shareOnWhatsApp = function () {
    if (!requestData || !requestData.url) {
      console.error('Card URL is undefined');
      return;
    }
    
    const message = `Check out this Biznfc card: `;
  
    if (navigator.share) {
      navigator.share({
        title: 'Biznfc Card',
        text: message,
        url: '/cards/' + requestData.url
      }).then(() => {
        console.log('Thanks for sharing!');
      }).catch(err => {
        console.error('Error sharing:', err);
      });
    } else {
      // Fallback for browsers that do not support navigator.share
      window.open(`https://wa.me/?text=${encodeURIComponent(message + ' ' + requestData.url)}`, '_blank');
    }
  };
  
});
