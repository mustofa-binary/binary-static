/* eslint-disable */
import React from 'react';
import Cookies from 'js-cookies';
import { isEuCountry } from '../../../app/common/country_base';
// IsEu
// Cookies Consent

class GTM extends React.PureComponent {
    state = {
        is_gtm_required: false,
    }
    componentDidMount() {
        if (isEuCountry() && Cookies.get('CookieConsent')) {
            this.setState({ is_gtm_required: true });
        }
    }
    render() {
        return this.state.is_gtm_required ? (
            <React.Fragment>
                <noscript><iframe src="//www.googletagmanager.com/ns.html?id=GTM-MZWFF7" height="0" width="0" style={{display: 'none', visibility: 'hidden'}}></iframe></noscript>
                <script data-cfasync="false" dangerouslySetInnerHTML={{__html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='//www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-MZWFF7');`}}></script>
            </React.Fragment>
        ) : null;
    }
}

export default GTM;
