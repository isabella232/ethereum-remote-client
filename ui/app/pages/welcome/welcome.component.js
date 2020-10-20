import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import ConnectWallet from '../../components/app/connect-wallet'
import BitGoLogoIcon from '../../../../brave/ui/app/components/app/dropdowns/assets/bitgo-logo'
import CloseIcon from '../../components/ui/icon/close-icon'
import CloseIconDark from '../../components/ui/icon/close-icon-dark'

import {
  BRAVE_BITGO_WALLET_INDEX,
  BRAVE_CONNECT_WALLETS_ROUTE,
  INITIALIZE_CREATE_PASSWORD_ROUTE,
  INITIALIZE_IMPORT_WITH_SEED_PHRASE_ROUTE,
} from '../../helpers/constants/routes'

const { supportedCoins } = require('../../../../app/scripts/controllers/bitgo')

export default class BraveWelcome extends PureComponent {
  static contextTypes = {
    t: PropTypes.func,
  }

  static propTypes = {
    history: PropTypes.object,
    setHardwareConnect: PropTypes.func,
    createBitGoWallet: PropTypes.func,
    bitGoCreatedWallets: PropTypes.array,
  }

  static defaultProps = {
    bitGoCreatedWallets: [],
  }

  constructor(props) {
    super(props)

    const checkedAssets = {}
    const { bitGoCreatedWallets } = this.props
    this.bitGoCreateableAssets = {}

    for (let coin in supportedCoins) {
      if (!bitGoCreatedWallets.includes(coin)) {
        this.bitGoCreateableAssets[coin] = supportedCoins[coin]
      }
    }

    Object.keys(this.bitGoCreateableAssets).map((key) => {
      checkedAssets[key] = false
    })

    this.state = {
      checkedAssets,
      showBitGoModal: false
    }
  }

  onCreate = (hardware = false) => {
    if (hardware) {
      this.props.setHardwareConnect(true)
    }

    this.props.history.push(INITIALIZE_CREATE_PASSWORD_ROUTE)
  }

  onConnectFinish = () => {
    this.props.history.push(BRAVE_CONNECT_WALLETS_ROUTE)
  }

  onCreateBitGoWallets = () => {
    const { checkedAssets } = this.state

    for (let coin in checkedAssets) {
      if (checkedAssets[coin]) {
        this.props.createBitGoWallet(coin)
      }
    }

    this.props.history.push(BRAVE_BITGO_WALLET_INDEX)
  }

  onConnectBitGoWallets = () => {
    this.setState({ showBitGoModal: !this.state.showBitGoModal })
  }
  onRestore = () => {
    this.props.history.push(INITIALIZE_IMPORT_WITH_SEED_PHRASE_ROUTE)
  }

  checkAsset = (asset) => {
    const { checkedAssets } = this.state
    checkedAssets[asset] = !checkedAssets[asset]
    this.setState({ checkedAssets })
  }

  getCryptoImage = (asset) => {
    // temporary
    if (asset === 'bsv' || asset === 'btg' || asset === 'eos' || asset === 'algo') {
      asset = 'btc'
    }

    return (
      <img src={`images/${asset}-small.png`} />
    )
  }

  renderBitGoModal () {
    const { checkedAssets } = this.state

    return (
      <div className="welcome-modal">
        <div className="__modal">
          <div className="__close" onClick={this.onConnectBitGoWallets}>
            <div className="close-light">
              <CloseIcon />
            </div>
            <div className="close-dark">
              <CloseIconDark />
            </div>
          </div>
          <div className="__content __bitgo" style={{ textAlign: 'left' }}>
            <BitGoLogoIcon />
            <h3>
              {'Select all crypto assets you would like to interact with.'}
            </h3>
            <p>{'A new wallet will be generated for each coin checked. Two of three private keys are stored on BitGo. The third key will be stored securely on Brave.'}</p>
            <div className="__wallets-area">
              {Object.keys(this.bitGoCreateableAssets).map((key) => {
                const isChecked = checkedAssets[key]

                return (
                  <div
                    key={`${key}-wallet`}
                    className={'__bitgo-wallet-item'}
                    onClick={this.checkAsset.bind(this, key)}>
                      <div className="__left-info">
                        <div className={`__checkmark ${isChecked ? 'checked' : ''}`}>
                        </div>
                        <div className="__asset-icon">
                          {this.getCryptoImage(key)}
                        </div>
                        <div className="__asset-name">
                          {this.bitGoCreateableAssets[key]}
                        </div>
                      </div>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="__button-container">
            <button type="__button-create" onClick={this.onCreateBitGoWallets}>
              {'Create Wallets'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  render () {
    const { t } = this.context
    const { showBitGoModal } = this.state

    return (
      <div className="welcome-container">
        {
          showBitGoModal
          ? this.renderBitGoModal()
          : null
        }
        <div className="content">
          <div>
            <div className="welcome-title">
              <span>{t('cryptoWalletsTitle')}</span>
            </div>
          </div>
          <div>
            <ConnectWallet
              type="browser"
              onCreate={this.onCreate}
              onRestore={this.onRestore}
            />
            <ConnectWallet
              type="bitgo"
              onCreate={this.onConnectBitGoWallets}
            />
            <ConnectWallet
              type="ledger"
              onCreate={this.onCreate.bind(this, true)}
            />
            <ConnectWallet
              type="trezor"
              onCreate={this.onCreate.bind(this, true)}
            />
          </div>
        </div>
      </div>
    )
  }
}