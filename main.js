window.onload = () => {
  let abiArray = [
    {
      inputs: [{ internalType: 'address', name: '', type: 'address' }],
      name: 'stakerInfo',
      outputs: [
        { internalType: 'uint256', name: 'amount', type: 'uint256' },
        { internalType: 'uint256', name: 'startStakeTime', type: 'uint256' },
        { internalType: 'uint16', name: 'claimedEggs', type: 'uint16' },
        { internalType: 'uint256', name: 'claimedTickets', type: 'uint256' },
      ],
      stateMutability: 'view',
      type: 'function',
    },

    {
      inputs: [{ internalType: 'address', name: '_user', type: 'address' }],
      name: 'countTicketsClaimable',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },

    {
      inputs: [{ internalType: 'address', name: '_user', type: 'address' }],
      name: 'getDeliveryTimeForEgg',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },

    {
      inputs: [],
      name: 'currentStakers',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ]

  const relativeTime = new RelativeTime()

  const inputAddress = document.getElementById('walletAddress')
  const btnSend = document.getElementById('send')
  var walletAddress = ''
  const cardsContainer = document.getElementById('cards_container')

  const ethAvailableSlotsText = document.getElementById('ethAvailableSlots')
  const bscAvailableSlotsText = document.getElementById('bscAvailableSlots')
  const polygonAvailableSlotsText = document.getElementById('polygonAvailableSlots')

  const ethWeb3 = new Web3('https://cloudflare-eth.com/')
  const bscWeb3 = new Web3('https://bsc-dataseed.binance.org/')
  const polygonWeb3 = new Web3('https://rpc-mainnet.maticvigil.com')

  // -----------------------------------------------------------------------------
  async function getAvailableSlots() {
    const ethStakeContract = await new ethWeb3.eth.Contract(abiArray, '0xB2643342434a46B5088E17C7606cF81f6911647e')
    const bscStakeContract = await new bscWeb3.eth.Contract(abiArray, '0x38DEa99CBae327E2710eB4C05587CA9355fc1Ed2')
    const polygonStakeContract = await new polygonWeb3.eth.Contract(
      abiArray,
      '0x6780e3DB2513db9Ebc471bd0E9Ca8631F08ed071'
    )

    const ethStakers = await ethStakeContract.methods.currentStakers().call()
    const bscStakers = await bscStakeContract.methods.currentStakers().call()
    const polygonStakers = await polygonStakeContract.methods.currentStakers().call()

    ethAvailableSlotsText.innerHTML = `<img src="./img/eth.png" alt="" /> ${1500 - ethStakers}`
    bscAvailableSlotsText.innerHTML = ` <img src="./img/bsc.png" alt="" /> ${5500 - bscStakers}`
    polygonAvailableSlotsText.innerHTML = ` <img src="./img/polygon.png" alt="" /> ${1000 - polygonStakers}`
  }

  // -----------------------------------------------------------------------------
  function addAddressStorage() {
    let addressArray = JSON.parse(localStorage.getItem('addressStorage')) || []
    if (addressArray.includes(walletAddress)) {
      console.log('ya existe')
      return false
    }
    addressArray.push(walletAddress)
    localStorage.setItem('addressStorage', JSON.stringify(addressArray))
    return true
  }

  // -----------------------------------------------------------------------------

  function createCardStaking(id, img, chain, dnxc, tickets, time, relative) {
    let cardsForAddres = document.getElementById(id)
    let cardsContent = document.createElement('div')
    let pool = document.createElement('p')
    let yourStakedDNXC = document.createElement('p')
    let availableTickets = document.createElement('p')
    let timeTillEgg = document.createElement('p')
    let relativeTime = document.createElement('p')
    let chainLogo = document.createElement('img')

    cardsContent.className = 'cards_content'
    chainLogo.className = 'chain_logo'
    pool.innerHTML = `${'Pool'.bold()} <br\> ${chain}`
    yourStakedDNXC.innerHTML = `${'Your Staked DNXC'.bold()} <br\> ${dnxc}`
    availableTickets.innerHTML = `${'Available Tickets'.bold()} <br\> ${tickets}`
    timeTillEgg.innerHTML = `${'Time Till Egg'.bold()} <br\> ${time}`
    relativeTime.innerHTML = `( ${relative} )`
    chainLogo.src = img

    cardsForAddres.appendChild(cardsContent)
    cardsContent.appendChild(pool)
    cardsContent.appendChild(yourStakedDNXC)
    cardsContent.appendChild(availableTickets)
    cardsContent.appendChild(timeTillEgg)
    cardsContent.appendChild(relativeTime)
    cardsContent.appendChild(chainLogo)
  }

  // -----------------------------------------------------------------------------
  async function addStakingInfo() {
    if (localStorage.getItem('addressStorage') === null) {
      return
    }

    const ethStakeContract = await new ethWeb3.eth.Contract(abiArray, '0xB2643342434a46B5088E17C7606cF81f6911647e')
    const bscStakeContract = await new bscWeb3.eth.Contract(abiArray, '0x38DEa99CBae327E2710eB4C05587CA9355fc1Ed2')
    const polygonStakeContract = await new polygonWeb3.eth.Contract(
      abiArray,
      '0x6780e3DB2513db9Ebc471bd0E9Ca8631F08ed071'
    )

    let addressArray = JSON.parse(localStorage.getItem('addressStorage'))

    for (const i of addressArray) {
      let yourAddress = document.createElement('h2')
      yourAddress.textContent = i.substring(0, 15) + '...'
      cardsContainer.appendChild(yourAddress)

      let btnRemoveAddress = document.createElement('button')
      btnRemoveAddress.className = 'btnRemoveAddress'
      btnRemoveAddress.id = 'btnRemoveAddress'
      btnRemoveAddress.textContent = '❌'
      yourAddress.appendChild(btnRemoveAddress)

      let mainContainer = document.getElementById('cards_container')
      let divForAddres = document.createElement('div')
      divForAddres.id = i
      divForAddres.className = 'cardsForAddress'
      mainContainer.appendChild(divForAddres)

      const ethInfo = await ethStakeContract.methods.stakerInfo(i).call()
      const bscInfo = await bscStakeContract.methods.stakerInfo(i).call()
      const polygonInfo = await polygonStakeContract.methods.stakerInfo(i).call()

      if (ethInfo.startStakeTime !== '0') {
        const ethTicketsClaimable = await ethStakeContract.methods.countTicketsClaimable(i).call()
        const ethTimeForEgg = await ethStakeContract.methods.getDeliveryTimeForEgg(i).call()
        let relative = relativeTime.from(new Date(ethTimeForEgg * 1000))
        createCardStaking(
          i,
          './img/eth.png',
          'ETH',
          bscWeb3.utils.fromWei(ethInfo.amount, 'ether'),
          ethTicketsClaimable,
          new Date(ethTimeForEgg * 1000).toLocaleString(),
          relative
        )
      }

      if (bscInfo.startStakeTime !== '0') {
        const bscTicketsClaimable = await bscStakeContract.methods.countTicketsClaimable(i).call()
        const bscTimeForEgg = await bscStakeContract.methods.getDeliveryTimeForEgg(i).call()
        let relative = relativeTime.from(new Date(bscTimeForEgg * 1000))
        createCardStaking(
          i,
          './img/bsc.png',
          'BSC',
          bscWeb3.utils.fromWei(bscInfo.amount, 'ether'),
          bscTicketsClaimable,
          new Date(bscTimeForEgg * 1000).toLocaleString(),
          relative
        )
      }

      if (polygonInfo.startStakeTime !== '0') {
        const polygonTicketsClaimable = await polygonStakeContract.methods.countTicketsClaimable(i).call()
        const polygonTimeForEgg = await polygonStakeContract.methods.getDeliveryTimeForEgg(i).call()
        let relative = relativeTime.from(new Date(polygonTimeForEgg * 1000))
        createCardStaking(
          i,
          './img/polygon.png',
          'POLYGON',
          bscWeb3.utils.fromWei(polygonInfo.amount, 'ether'),
          polygonTicketsClaimable,
          new Date(polygonTimeForEgg * 1000).toLocaleString(),
          relative
        )
      }
    }
  }

  // -----------------------------------------------------------------------------
  btnSend.addEventListener('click', async (event) => {
    event.preventDefault()
    walletAddress = inputAddress.value
    if (bscWeb3.utils.isAddress(walletAddress) && addAddressStorage()) {
      addAddressStorage()
      location.reload()
    }
  })

  getAvailableSlots()
  addStakingInfo()

  // -----------------------------------------------------------------------------
  document.addEventListener('click', function (e) {
    if (e.target && e.target.id == 'btnRemoveAddress') {
      const valueToRemove = e.target.parentNode.nextSibling.id
      let addressStorage = JSON.parse(localStorage.getItem('addressStorage'))
      console.log(addressStorage)
      let arr = addressStorage.filter((item) => item !== valueToRemove)
      localStorage.setItem('addressStorage', JSON.stringify(arr))
      location.reload()
    }
  })
}
