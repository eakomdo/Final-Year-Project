import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Platform,
    Modal,
    FlatList
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { showError, showSuccess } from '../utils/NotificationHelper';

const SignUpScreen = ({ navigation }) => {
    const { register } = useAuth();
    const [loading, setLoading] = useState(false);
    
    // Comprehensive country codes data for all countries
    const countryCodes = [
        { label: '🇦🇫 Afghanistan +93', value: '+93', country: 'Afghanistan', code: 'AF' },
        { label: '🇦🇱 Albania +355', value: '+355', country: 'Albania', code: 'AL' },
        { label: '🇩🇿 Algeria +213', value: '+213', country: 'Algeria', code: 'DZ' },
        { label: '🇦🇩 Andorra +376', value: '+376', country: 'Andorra', code: 'AD' },
        { label: '🇦🇴 Angola +244', value: '+244', country: 'Angola', code: 'AO' },
        { label: '🇦🇬 Antigua and Barbuda +1', value: '+1', country: 'Antigua and Barbuda', code: 'AG' },
        { label: '🇦🇷 Argentina +54', value: '+54', country: 'Argentina', code: 'AR' },
        { label: '🇦🇲 Armenia +374', value: '+374', country: 'Armenia', code: 'AM' },
        { label: '🇦🇺 Australia +61', value: '+61', country: 'Australia', code: 'AU' },
        { label: '🇦🇹 Austria +43', value: '+43', country: 'Austria', code: 'AT' },
        { label: '🇦🇿 Azerbaijan +994', value: '+994', country: 'Azerbaijan', code: 'AZ' },
        { label: '🇧🇸 Bahamas +1', value: '+1', country: 'Bahamas', code: 'BS' },
        { label: '🇧🇭 Bahrain +973', value: '+973', country: 'Bahrain', code: 'BH' },
        { label: '🇧🇩 Bangladesh +880', value: '+880', country: 'Bangladesh', code: 'BD' },
        { label: '🇧🇧 Barbados +1', value: '+1', country: 'Barbados', code: 'BB' },
        { label: '🇧🇾 Belarus +375', value: '+375', country: 'Belarus', code: 'BY' },
        { label: '🇧🇪 Belgium +32', value: '+32', country: 'Belgium', code: 'BE' },
        { label: '🇧🇿 Belize +501', value: '+501', country: 'Belize', code: 'BZ' },
        { label: '🇧🇯 Benin +229', value: '+229', country: 'Benin', code: 'BJ' },
        { label: '🇧🇹 Bhutan +975', value: '+975', country: 'Bhutan', code: 'BT' },
        { label: '🇧🇴 Bolivia +591', value: '+591', country: 'Bolivia', code: 'BO' },
        { label: '🇧🇦 Bosnia and Herzegovina +387', value: '+387', country: 'Bosnia and Herzegovina', code: 'BA' },
        { label: '🇧🇼 Botswana +267', value: '+267', country: 'Botswana', code: 'BW' },
        { label: '🇧🇷 Brazil +55', value: '+55', country: 'Brazil', code: 'BR' },
        { label: '🇧🇳 Brunei +673', value: '+673', country: 'Brunei', code: 'BN' },
        { label: '🇧🇬 Bulgaria +359', value: '+359', country: 'Bulgaria', code: 'BG' },
        { label: '🇧🇫 Burkina Faso +226', value: '+226', country: 'Burkina Faso', code: 'BF' },
        { label: '🇧🇮 Burundi +257', value: '+257', country: 'Burundi', code: 'BI' },
        { label: '🇰🇭 Cambodia +855', value: '+855', country: 'Cambodia', code: 'KH' },
        { label: '🇨🇲 Cameroon +237', value: '+237', country: 'Cameroon', code: 'CM' },
        { label: '🇨🇦 Canada +1', value: '+1', country: 'Canada', code: 'CA' },
        { label: '🇨🇻 Cape Verde +238', value: '+238', country: 'Cape Verde', code: 'CV' },
        { label: '🇨🇫 Central African Republic +236', value: '+236', country: 'Central African Republic', code: 'CF' },
        { label: '🇹🇩 Chad +235', value: '+235', country: 'Chad', code: 'TD' },
        { label: '🇨🇱 Chile +56', value: '+56', country: 'Chile', code: 'CL' },
        { label: '🇨🇳 China +86', value: '+86', country: 'China', code: 'CN' },
        { label: '🇨🇴 Colombia +57', value: '+57', country: 'Colombia', code: 'CO' },
        { label: '🇰🇲 Comoros +269', value: '+269', country: 'Comoros', code: 'KM' },
        { label: '🇨🇬 Congo +242', value: '+242', country: 'Congo', code: 'CG' },
        { label: '🇨🇩 Democratic Republic of the Congo +243', value: '+243', country: 'Democratic Republic of the Congo', code: 'CD' },
        { label: '🇨🇷 Costa Rica +506', value: '+506', country: 'Costa Rica', code: 'CR' },
        { label: '🇭🇷 Croatia +385', value: '+385', country: 'Croatia', code: 'HR' },
        { label: '🇨🇺 Cuba +53', value: '+53', country: 'Cuba', code: 'CU' },
        { label: '🇨🇾 Cyprus +357', value: '+357', country: 'Cyprus', code: 'CY' },
        { label: '🇨🇿 Czech Republic +420', value: '+420', country: 'Czech Republic', code: 'CZ' },
        { label: '🇩🇰 Denmark +45', value: '+45', country: 'Denmark', code: 'DK' },
        { label: '🇩🇯 Djibouti +253', value: '+253', country: 'Djibouti', code: 'DJ' },
        { label: '🇩🇲 Dominica +1', value: '+1', country: 'Dominica', code: 'DM' },
        { label: '🇩🇴 Dominican Republic +1', value: '+1', country: 'Dominican Republic', code: 'DO' },
        { label: '🇪🇨 Ecuador +593', value: '+593', country: 'Ecuador', code: 'EC' },
        { label: '🇪🇬 Egypt +20', value: '+20', country: 'Egypt', code: 'EG' },
        { label: '🇸🇻 El Salvador +503', value: '+503', country: 'El Salvador', code: 'SV' },
        { label: '🇬🇶 Equatorial Guinea +240', value: '+240', country: 'Equatorial Guinea', code: 'GQ' },
        { label: '🇪🇷 Eritrea +291', value: '+291', country: 'Eritrea', code: 'ER' },
        { label: '🇪🇪 Estonia +372', value: '+372', country: 'Estonia', code: 'EE' },
        { label: '🇪🇹 Ethiopia +251', value: '+251', country: 'Ethiopia', code: 'ET' },
        { label: '🇫🇯 Fiji +679', value: '+679', country: 'Fiji', code: 'FJ' },
        { label: '🇫🇮 Finland +358', value: '+358', country: 'Finland', code: 'FI' },
        { label: '🇫🇷 France +33', value: '+33', country: 'France', code: 'FR' },
        { label: '🇬🇦 Gabon +241', value: '+241', country: 'Gabon', code: 'GA' },
        { label: '🇬🇲 Gambia +220', value: '+220', country: 'Gambia', code: 'GM' },
        { label: '🇬🇪 Georgia +995', value: '+995', country: 'Georgia', code: 'GE' },
        { label: '🇩🇪 Germany +49', value: '+49', country: 'Germany', code: 'DE' },
        { label: '🇬🇭 Ghana +233', value: '+233', country: 'Ghana', code: 'GH' },
        { label: '🇬🇷 Greece +30', value: '+30', country: 'Greece', code: 'GR' },
        { label: '🇬🇩 Grenada +1', value: '+1', country: 'Grenada', code: 'GD' },
        { label: '🇬🇹 Guatemala +502', value: '+502', country: 'Guatemala', code: 'GT' },
        { label: '🇬🇳 Guinea +224', value: '+224', country: 'Guinea', code: 'GN' },
        { label: '🇬🇼 Guinea-Bissau +245', value: '+245', country: 'Guinea-Bissau', code: 'GW' },
        { label: '🇬🇾 Guyana +592', value: '+592', country: 'Guyana', code: 'GY' },
        { label: '🇭🇹 Haiti +509', value: '+509', country: 'Haiti', code: 'HT' },
        { label: '🇭🇳 Honduras +504', value: '+504', country: 'Honduras', code: 'HN' },
        { label: '🇭🇺 Hungary +36', value: '+36', country: 'Hungary', code: 'HU' },
        { label: '🇮🇸 Iceland +354', value: '+354', country: 'Iceland', code: 'IS' },
        { label: '🇮🇳 India +91', value: '+91', country: 'India', code: 'IN' },
        { label: '🇮🇩 Indonesia +62', value: '+62', country: 'Indonesia', code: 'ID' },
        { label: '🇮🇷 Iran +98', value: '+98', country: 'Iran', code: 'IR' },
        { label: '🇮🇶 Iraq +964', value: '+964', country: 'Iraq', code: 'IQ' },
        { label: '🇮🇪 Ireland +353', value: '+353', country: 'Ireland', code: 'IE' },
        { label: '🇮🇱 Israel +972', value: '+972', country: 'Israel', code: 'IL' },
        { label: '🇮🇹 Italy +39', value: '+39', country: 'Italy', code: 'IT' },
        { label: '🇨🇮 Ivory Coast +225', value: '+225', country: 'Ivory Coast', code: 'CI' },
        { label: '🇯🇲 Jamaica +1', value: '+1', country: 'Jamaica', code: 'JM' },
        { label: '🇯🇵 Japan +81', value: '+81', country: 'Japan', code: 'JP' },
        { label: '🇯🇴 Jordan +962', value: '+962', country: 'Jordan', code: 'JO' },
        { label: '🇰🇿 Kazakhstan +7', value: '+7', country: 'Kazakhstan', code: 'KZ' },
        { label: '🇰🇪 Kenya +254', value: '+254', country: 'Kenya', code: 'KE' },
        { label: '🇰🇮 Kiribati +686', value: '+686', country: 'Kiribati', code: 'KI' },
        { label: '🇰🇼 Kuwait +965', value: '+965', country: 'Kuwait', code: 'KW' },
        { label: '🇰🇬 Kyrgyzstan +996', value: '+996', country: 'Kyrgyzstan', code: 'KG' },
        { label: '🇱🇦 Laos +856', value: '+856', country: 'Laos', code: 'LA' },
        { label: '🇱🇻 Latvia +371', value: '+371', country: 'Latvia', code: 'LV' },
        { label: '🇱🇧 Lebanon +961', value: '+961', country: 'Lebanon', code: 'LB' },
        { label: '🇱🇸 Lesotho +266', value: '+266', country: 'Lesotho', code: 'LS' },
        { label: '🇱🇷 Liberia +231', value: '+231', country: 'Liberia', code: 'LR' },
        { label: '🇱🇾 Libya +218', value: '+218', country: 'Libya', code: 'LY' },
        { label: '🇱🇮 Liechtenstein +423', value: '+423', country: 'Liechtenstein', code: 'LI' },
        { label: '🇱🇹 Lithuania +370', value: '+370', country: 'Lithuania', code: 'LT' },
        { label: '🇱🇺 Luxembourg +352', value: '+352', country: 'Luxembourg', code: 'LU' },
        { label: '🇲🇬 Madagascar +261', value: '+261', country: 'Madagascar', code: 'MG' },
        { label: '🇲🇼 Malawi +265', value: '+265', country: 'Malawi', code: 'MW' },
        { label: '🇲🇾 Malaysia +60', value: '+60', country: 'Malaysia', code: 'MY' },
        { label: '🇲🇻 Maldives +960', value: '+960', country: 'Maldives', code: 'MV' },
        { label: '🇲🇱 Mali +223', value: '+223', country: 'Mali', code: 'ML' },
        { label: '🇲🇹 Malta +356', value: '+356', country: 'Malta', code: 'MT' },
        { label: '🇲🇭 Marshall Islands +692', value: '+692', country: 'Marshall Islands', code: 'MH' },
        { label: '🇲🇷 Mauritania +222', value: '+222', country: 'Mauritania', code: 'MR' },
        { label: '🇲🇺 Mauritius +230', value: '+230', country: 'Mauritius', code: 'MU' },
        { label: '🇲🇽 Mexico +52', value: '+52', country: 'Mexico', code: 'MX' },
        { label: '🇫🇲 Micronesia +691', value: '+691', country: 'Micronesia', code: 'FM' },
        { label: '🇲🇩 Moldova +373', value: '+373', country: 'Moldova', code: 'MD' },
        { label: '🇲🇨 Monaco +377', value: '+377', country: 'Monaco', code: 'MC' },
        { label: '🇲🇳 Mongolia +976', value: '+976', country: 'Mongolia', code: 'MN' },
        { label: '🇲🇪 Montenegro +382', value: '+382', country: 'Montenegro', code: 'ME' },
        { label: '🇲🇦 Morocco +212', value: '+212', country: 'Morocco', code: 'MA' },
        { label: '🇲🇿 Mozambique +258', value: '+258', country: 'Mozambique', code: 'MZ' },
        { label: '🇲🇲 Myanmar +95', value: '+95', country: 'Myanmar', code: 'MM' },
        { label: '🇳🇦 Namibia +264', value: '+264', country: 'Namibia', code: 'NA' },
        { label: '🇳🇷 Nauru +674', value: '+674', country: 'Nauru', code: 'NR' },
        { label: '🇳🇵 Nepal +977', value: '+977', country: 'Nepal', code: 'NP' },
        { label: '🇳🇱 Netherlands +31', value: '+31', country: 'Netherlands', code: 'NL' },
        { label: '🇳🇿 New Zealand +64', value: '+64', country: 'New Zealand', code: 'NZ' },
        { label: '🇳🇮 Nicaragua +505', value: '+505', country: 'Nicaragua', code: 'NI' },
        { label: '🇳🇪 Niger +227', value: '+227', country: 'Niger', code: 'NE' },
        { label: '🇳🇬 Nigeria +234', value: '+234', country: 'Nigeria', code: 'NG' },
        { label: '🇰🇵 North Korea +850', value: '+850', country: 'North Korea', code: 'KP' },
        { label: '🇲🇰 North Macedonia +389', value: '+389', country: 'North Macedonia', code: 'MK' },
        { label: '🇳🇴 Norway +47', value: '+47', country: 'Norway', code: 'NO' },
        { label: '🇴🇲 Oman +968', value: '+968', country: 'Oman', code: 'OM' },
        { label: '🇵🇰 Pakistan +92', value: '+92', country: 'Pakistan', code: 'PK' },
        { label: '🇵🇼 Palau +680', value: '+680', country: 'Palau', code: 'PW' },
        { label: '🇵🇸 Palestine +970', value: '+970', country: 'Palestine', code: 'PS' },
        { label: '🇵🇦 Panama +507', value: '+507', country: 'Panama', code: 'PA' },
        { label: '🇵🇬 Papua New Guinea +675', value: '+675', country: 'Papua New Guinea', code: 'PG' },
        { label: '🇵🇾 Paraguay +595', value: '+595', country: 'Paraguay', code: 'PY' },
        { label: '🇵🇪 Peru +51', value: '+51', country: 'Peru', code: 'PE' },
        { label: '🇵🇭 Philippines +63', value: '+63', country: 'Philippines', code: 'PH' },
        { label: '🇵🇱 Poland +48', value: '+48', country: 'Poland', code: 'PL' },
        { label: '🇵🇹 Portugal +351', value: '+351', country: 'Portugal', code: 'PT' },
        { label: '🇶🇦 Qatar +974', value: '+974', country: 'Qatar', code: 'QA' },
        { label: '🇷🇴 Romania +40', value: '+40', country: 'Romania', code: 'RO' },
        { label: '🇷🇺 Russia +7', value: '+7', country: 'Russia', code: 'RU' },
        { label: '🇷🇼 Rwanda +250', value: '+250', country: 'Rwanda', code: 'RW' },
        { label: '🇰🇳 Saint Kitts and Nevis +1', value: '+1', country: 'Saint Kitts and Nevis', code: 'KN' },
        { label: '🇱🇨 Saint Lucia +1', value: '+1', country: 'Saint Lucia', code: 'LC' },
        { label: '🇻🇨 Saint Vincent and the Grenadines +1', value: '+1', country: 'Saint Vincent and the Grenadines', code: 'VC' },
        { label: '🇼🇸 Samoa +685', value: '+685', country: 'Samoa', code: 'WS' },
        { label: '🇸🇲 San Marino +378', value: '+378', country: 'San Marino', code: 'SM' },
        { label: '🇸🇹 Sao Tome and Principe +239', value: '+239', country: 'Sao Tome and Principe', code: 'ST' },
        { label: '🇸🇦 Saudi Arabia +966', value: '+966', country: 'Saudi Arabia', code: 'SA' },
        { label: '🇸🇳 Senegal +221', value: '+221', country: 'Senegal', code: 'SN' },
        { label: '🇷🇸 Serbia +381', value: '+381', country: 'Serbia', code: 'RS' },
        { label: '🇸🇨 Seychelles +248', value: '+248', country: 'Seychelles', code: 'SC' },
        { label: '🇸🇱 Sierra Leone +232', value: '+232', country: 'Sierra Leone', code: 'SL' },
        { label: '🇸🇬 Singapore +65', value: '+65', country: 'Singapore', code: 'SG' },
        { label: '🇸🇰 Slovakia +421', value: '+421', country: 'Slovakia', code: 'SK' },
        { label: '🇸🇮 Slovenia +386', value: '+386', country: 'Slovenia', code: 'SI' },
        { label: '🇸🇧 Solomon Islands +677', value: '+677', country: 'Solomon Islands', code: 'SB' },
        { label: '🇸🇴 Somalia +252', value: '+252', country: 'Somalia', code: 'SO' },
        { label: '🇿🇦 South Africa +27', value: '+27', country: 'South Africa', code: 'ZA' },
        { label: '🇰🇷 South Korea +82', value: '+82', country: 'South Korea', code: 'KR' },
        { label: '🇸🇸 South Sudan +211', value: '+211', country: 'South Sudan', code: 'SS' },
        { label: '🇪🇸 Spain +34', value: '+34', country: 'Spain', code: 'ES' },
        { label: '🇱🇰 Sri Lanka +94', value: '+94', country: 'Sri Lanka', code: 'LK' },
        { label: '🇸🇩 Sudan +249', value: '+249', country: 'Sudan', code: 'SD' },
        { label: '🇸🇷 Suriname +597', value: '+597', country: 'Suriname', code: 'SR' },
        { label: '🇸🇪 Sweden +46', value: '+46', country: 'Sweden', code: 'SE' },
        { label: '🇨🇭 Switzerland +41', value: '+41', country: 'Switzerland', code: 'CH' },
        { label: '🇸🇾 Syria +963', value: '+963', country: 'Syria', code: 'SY' },
        { label: '🇹🇼 Taiwan +886', value: '+886', country: 'Taiwan', code: 'TW' },
        { label: '🇹🇯 Tajikistan +992', value: '+992', country: 'Tajikistan', code: 'TJ' },
        { label: '🇹🇿 Tanzania +255', value: '+255', country: 'Tanzania', code: 'TZ' },
        { label: '🇹🇭 Thailand +66', value: '+66', country: 'Thailand', code: 'TH' },
        { label: '🇹🇱 Timor-Leste +670', value: '+670', country: 'Timor-Leste', code: 'TL' },
        { label: '🇹🇬 Togo +228', value: '+228', country: 'Togo', code: 'TG' },
        { label: '🇹🇴 Tonga +676', value: '+676', country: 'Tonga', code: 'TO' },
        { label: '🇹🇹 Trinidad and Tobago +1', value: '+1', country: 'Trinidad and Tobago', code: 'TT' },
        { label: '🇹🇳 Tunisia +216', value: '+216', country: 'Tunisia', code: 'TN' },
        { label: '🇹🇷 Turkey +90', value: '+90', country: 'Turkey', code: 'TR' },
        { label: '🇹🇲 Turkmenistan +993', value: '+993', country: 'Turkmenistan', code: 'TM' },
        { label: '🇹🇻 Tuvalu +688', value: '+688', country: 'Tuvalu', code: 'TV' },
        { label: '🇺🇬 Uganda +256', value: '+256', country: 'Uganda', code: 'UG' },
        { label: '🇺🇦 Ukraine +380', value: '+380', country: 'Ukraine', code: 'UA' },
        { label: '🇦🇪 United Arab Emirates +971', value: '+971', country: 'United Arab Emirates', code: 'AE' },
        { label: '🇬🇧 United Kingdom +44', value: '+44', country: 'United Kingdom', code: 'GB' },
        { label: '🇺🇸 United States +1', value: '+1', country: 'United States', code: 'US' },
        { label: '🇺🇾 Uruguay +598', value: '+598', country: 'Uruguay', code: 'UY' },
        { label: '🇺🇿 Uzbekistan +998', value: '+998', country: 'Uzbekistan', code: 'UZ' },
        { label: '🇻🇺 Vanuatu +678', value: '+678', country: 'Vanuatu', code: 'VU' },
        { label: '🇻🇦 Vatican City +39', value: '+39', country: 'Vatican City', code: 'VA' },
        { label: '🇻🇪 Venezuela +58', value: '+58', country: 'Venezuela', code: 'VE' },
        { label: '🇻🇳 Vietnam +84', value: '+84', country: 'Vietnam', code: 'VN' },
        { label: '🇾🇪 Yemen +967', value: '+967', country: 'Yemen', code: 'YE' },
        { label: '🇿🇲 Zambia +260', value: '+260', country: 'Zambia', code: 'ZM' },
        { label: '🇿🇼 Zimbabwe +263', value: '+263', country: 'Zimbabwe', code: 'ZW' },
    ];

    const [formData, setFormData] = useState({
        username: '',
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirm: '',
        phone_number: '',
        date_of_birth: '',
        gender: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedCountryCode, setSelectedCountryCode] = useState('+1');
    const [showCountryPicker, setShowCountryPicker] = useState(false);
    const [countrySearch, setCountrySearch] = useState('');

    const handleSignUp = async () => {
        try {
            // Validation
            if (!formData.username || !formData.first_name || !formData.last_name || !formData.email || !formData.password || !formData.password_confirm || !formData.phone_number || !formData.date_of_birth || !formData.gender) {
                showError('Error', 'Please fill in all required fields');
                return;
            }

            if (formData.password !== formData.password_confirm) {
                showError('Error', 'Passwords do not match');
                return;
            }

            if (formData.password.length < 8) {
                showError('Error', 'Password must be at least 8 characters long');
                return;
            }

            // Email format validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                showError('Error', 'Please enter a valid email address');
                return;
            }

            setLoading(true);

            const userData = {
                email: formData.email?.trim() || '',
                password: formData.password || '',
                password_confirm: formData.password_confirm || '',
                first_name: formData.first_name?.trim() || '',
                last_name: formData.last_name?.trim() || '',
            };

            // Optionally add username if provided
            if (formData.username?.trim()) {
                userData.username = formData.username.trim();
            }

            // Optionally add phone_number if provided
            if (formData.phone_number?.trim()) {
                userData.phone_number = `${selectedCountryCode}${formData.phone_number.trim()}`;
            }

            // Optionally add date_of_birth if provided
            if (formData.date_of_birth?.trim()) {
                userData.date_of_birth = formData.date_of_birth.trim();
            }

            // Optionally add gender if provided
            if (formData.gender) {
                userData.gender = formData.gender;
            }

            console.log('[DEBUG] Registration payload:', userData);
            const result = await register(userData);

            if (result.success) {
                showSuccess('Success', 'Account created successfully!');
            } else {
                let errorMessage = result.error;
                showError('Registration Failed', errorMessage);
            }
        } catch (error) {
            showError('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const updateFormData = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleDateChange = (event, date) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }
        
        if (date) {
            setSelectedDate(date);
            // Format date as YYYY-MM-DD
            const formattedDate = date.toISOString().split('T')[0];
            updateFormData('date_of_birth', formattedDate);
        }
    };

    const showDatePickerModal = () => {
        // If there's already a date_of_birth, use it as the initial date
        if (formData.date_of_birth) {
            setSelectedDate(new Date(formData.date_of_birth));
        }
        setShowDatePicker(true);
    };

    const formatDateDisplay = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getFilteredCountries = () => {
        if (!countrySearch) return countryCodes;
        
        return countryCodes.filter(country => 
            country.country.toLowerCase().includes(countrySearch.toLowerCase()) ||
            country.value.includes(countrySearch) ||
            country.code.toLowerCase().includes(countrySearch.toLowerCase())
        );
    };

    const getSelectedCountryLabel = () => {
        const country = countryCodes.find(c => c.value === selectedCountryCode);
        return country ? country.label : selectedCountryCode;
    };

    const selectCountry = (country) => {
        setSelectedCountryCode(country.value);
        setShowCountryPicker(false);
        setCountrySearch('');
    };

    return (
        <View style={styles.container}>
            {/* Background Gradient */}
            <LinearGradient
                colors={['#4ECDC4', '#2D8B85', '#1A5F5A']}
                style={styles.backgroundGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />
            
            {/* Decorative Elements */}
            <View style={styles.decorativeCircle1} />
            <View style={styles.decorativeCircle2} />
            <View style={styles.decorativeLeaf1} />
            <View style={styles.decorativeLeaf2} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.navigate('SignIn')}
                >
                    <Feather name="arrow-left" size={24} color="white" />
                    <Text style={styles.backButtonText}>Back to login</Text>
                </TouchableOpacity>
            </View>

            {/* Welcome Section */}
            <View style={styles.welcomeSection}>
                <Text style={styles.welcomeTitle}>Hello!</Text>
                <Text style={styles.welcomeSubtitle}>Welcome to JEGHealth</Text>
            </View>

            {/* Form Card */}
            <ScrollView 
                style={styles.formContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.formContent}
            >
                <Text style={styles.formTitle}>Sign Up</Text>

                {/* Username */}
                <View style={styles.inputContainer}>
                    <Feather name="user" size={20} color="#7FCCCC" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Username"
                        placeholderTextColor="#B0B0B0"
                        value={formData.username}
                        onChangeText={(value) => updateFormData('username', value)}
                    />
                </View>

                {/* First Name */}
                <View style={styles.inputContainer}>
                    <Feather name="user" size={20} color="#7FCCCC" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="First Name"
                        placeholderTextColor="#B0B0B0"
                        value={formData.first_name}
                        onChangeText={(value) => updateFormData('first_name', value)}
                    />
                </View>

                {/* Last Name */}
                <View style={styles.inputContainer}>
                    <Feather name="user" size={20} color="#7FCCCC" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Last Name"
                        placeholderTextColor="#B0B0B0"
                        value={formData.last_name}
                        onChangeText={(value) => updateFormData('last_name', value)}
                    />
                </View>

                {/* Email */}
                <View style={styles.inputContainer}>
                    <Feather name="mail" size={20} color="#7FCCCC" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#B0B0B0"
                        value={formData.email}
                        onChangeText={(value) => updateFormData('email', value)}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                {/* Password */}
                <View style={styles.inputContainer}>
                    <Feather name="lock" size={20} color="#7FCCCC" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor="#B0B0B0"
                        value={formData.password}
                        onChangeText={(value) => updateFormData('password', value)}
                        secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Feather
                            name={showPassword ? "eye" : "eye-off"}
                            size={20}
                            color="#7FCCCC"
                        />
                    </TouchableOpacity>
                </View>

                {/* Confirm Password */}
                <View style={styles.inputContainer}>
                    <Feather name="lock" size={20} color="#7FCCCC" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Confirm Password"
                        placeholderTextColor="#B0B0B0"
                        value={formData.password_confirm}
                        onChangeText={(data_value) => {
                            // console.log('Confirm Password:', data_value);
                            updateFormData('password_confirm', data_value)}}
                        secureTextEntry={!showConfirmPassword}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                        <Feather
                            name={showConfirmPassword ? "eye" : "eye-off"}
                            size={20}
                            color="#7FCCCC"
                        />
                    </TouchableOpacity>
                </View>

                {/* Phone Number */}
                <View style={styles.phoneContainer}>
                    <TouchableOpacity 
                        style={styles.countryCodeContainer}
                        onPress={() => setShowCountryPicker(true)}
                    >
                        <Feather name="phone" size={20} color="#7FCCCC" style={styles.inputIcon} />
                        <Text style={styles.countryCodeText} numberOfLines={1}>
                            {getSelectedCountryLabel().split(' ')[0]} {selectedCountryCode}
                        </Text>
                        <Feather name="chevron-down" size={16} color="#7FCCCC" />
                    </TouchableOpacity>
                    <View style={styles.phoneInputContainer}>
                        <TextInput
                            style={styles.phoneInput}
                            placeholder="Phone Number"
                            placeholderTextColor="#B0B0B0"
                            value={formData.phone_number}
                            onChangeText={(value) => updateFormData('phone_number', value)}
                            keyboardType="phone-pad"
                        />
                    </View>
                </View>

                {/* Country Picker Modal */}
                <Modal
                    visible={showCountryPicker}
                    animationType="slide"
                    presentationStyle="pageSheet"
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity 
                                onPress={() => setShowCountryPicker(false)}
                                style={styles.modalCloseButton}
                            >
                                <Feather name="x" size={24} color="#2D8B85" />
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>Select Country</Text>
                            <View style={{ width: 24 }} />
                        </View>
                        
                        <View style={styles.searchContainer}>
                            <Feather name="search" size={20} color="#7FCCCC" style={styles.searchIcon} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search country or code..."
                                placeholderTextColor="#B0B0B0"
                                value={countrySearch}
                                onChangeText={setCountrySearch}
                                autoFocus={true}
                            />
                        </View>

                        <FlatList
                            data={getFilteredCountries()}
                            keyExtractor={(item, index) => `${item.code}-${index}`}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.countryItem,
                                        selectedCountryCode === item.value && styles.selectedCountryItem
                                    ]}
                                    onPress={() => selectCountry(item)}
                                >
                                    <Text style={styles.countryItemText}>{item.label}</Text>
                                    {selectedCountryCode === item.value && (
                                        <Feather name="check" size={20} color="#2D8B85" />
                                    )}
                                </TouchableOpacity>
                            )}
                            style={styles.countryList}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                </Modal>

                {/* Date of Birth */}
                <TouchableOpacity style={styles.inputContainer} onPress={showDatePickerModal}>
                    <Feather name="calendar" size={20} color="#7FCCCC" style={styles.inputIcon} />
                    <View style={styles.dateInputWrapper}>
                        <Text style={[styles.dateText, !formData.date_of_birth && styles.placeholderText]}>
                            {formData.date_of_birth ? formatDateDisplay(formData.date_of_birth) : 'Select Date of Birth'}
                        </Text>
                    </View>
                    <Feather name="chevron-down" size={20} color="#7FCCCC" />
                </TouchableOpacity>

                {showDatePicker && (
                    <DateTimePicker
                        value={selectedDate}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={handleDateChange}
                        maximumDate={new Date()}
                        minimumDate={new Date(1900, 0, 1)}
                        accentColor="#2D8B85"
                        themeVariant="light"
                    />
                )}

                {/* Gender */}
                <View style={styles.inputContainer}>
                    <Feather name="users" size={20} color="#7FCCCC" style={styles.inputIcon} />
                    <Picker
                        selectedValue={formData.gender}
                        onValueChange={(value) => updateFormData('gender', value)}
                        style={styles.picker}
                    >
                        <Picker.Item label="Select Gender" value="" />
                        <Picker.Item label="Male" value="MALE" />
                        <Picker.Item label="Female" value="FEMALE" />
                        <Picker.Item label="Other" value="OTHER" />
                    </Picker>
                </View>

                {/* Sign Up Button */}
                <TouchableOpacity
                    style={[styles.signUpButton, loading && styles.buttonDisabled]}
                    onPress={handleSignUp}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.signUpButtonText}>Create Account</Text>
                    )}
                </TouchableOpacity>

                {/* Sign In Link */}
                <View style={styles.signInLinkContainer}>
                    <Text style={styles.signInLinkText}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                        <Text style={styles.signInLink}>Sign In</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#4ECDC4',
    },
    backgroundGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    decorativeCircle1: {
        position: 'absolute',
        top: -50,
        right: -50,
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    decorativeCircle2: {
        position: 'absolute',
        top: 50,
        left: -100,
        width: 250,
        height: 250,
        borderRadius: 125,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    decorativeLeaf1: {
        position: 'absolute',
        top: 100,
        right: 50,
        width: 60,
        height: 80,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 30,
        transform: [{ rotate: '45deg' }],
    },
    decorativeLeaf2: {
        position: 'absolute',
        top: 150,
        left: 30,
        width: 40,
        height: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 20,
        transform: [{ rotate: '-30deg' }],
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButtonText: {
        color: 'white',
        fontSize: 16,
        marginLeft: 8,
        fontWeight: '500',
    },
    welcomeSection: {
        paddingHorizontal: 30,
        paddingBottom: 30,
    },
    welcomeTitle: {
        fontSize: 36,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 8,
    },
    welcomeSubtitle: {
        fontSize: 18,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '300',
    },
    formContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        flex: 1,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    formContent: {
        padding: 30,
        paddingTop: 40,
        paddingBottom: 100,
    },
    formTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2D8B85',
        marginBottom: 30,
        textAlign: 'left',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        marginBottom: 20,
        paddingHorizontal: 15,
        minHeight: 55,
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    inputIcon: {
        marginRight: 15,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        paddingVertical: 15,
    },
    pickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        marginBottom: 20,
        paddingHorizontal: 15,
        minHeight: 55,
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    picker: {
        flex: 1,
        color: '#333',
    },
    dateInputWrapper: {
        flex: 1,
        justifyContent: 'center',
        paddingVertical: 15,
    },
    dateText: {
        fontSize: 16,
        color: '#333',
    },
    placeholderText: {
        color: '#B0B0B0',
    },
    phoneContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        gap: 10,
    },
    countryCodeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        paddingHorizontal: 15,
        minHeight: 55,
        borderWidth: 1,
        borderColor: '#E9ECEF',
        flex: 0.4,
    },
    countryCodeText: {
        flex: 1,
        fontSize: 14,
        color: '#333',
        marginLeft: 5,
    },
    countryCodePicker: {
        flex: 1,
        color: '#333',
    },
    phoneInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        paddingHorizontal: 15,
        minHeight: 55,
        borderWidth: 1,
        borderColor: '#E9ECEF',
        flex: 0.6,
    },
    phoneInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        paddingVertical: 15,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'white',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E9ECEF',
    },
    modalCloseButton: {
        padding: 4,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2D8B85',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        marginHorizontal: 20,
        marginVertical: 20,
        paddingHorizontal: 15,
        minHeight: 50,
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        paddingVertical: 12,
    },
    countryList: {
        flex: 1,
        marginHorizontal: 20,
    },
    countryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    selectedCountryItem: {
        backgroundColor: '#F0F8F7',
    },
    countryItemText: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    signUpButton: {
        backgroundColor: '#2D8B85',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 25,
        shadowColor: '#2D8B85',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
        shadowOpacity: 0,
        elevation: 0,
    },
    signUpButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    infoContainer: {
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    infoText: {
        color: '#666',
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 16,
    },
    signInLinkContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    signInLinkText: {
        color: '#666',
        fontSize: 16,
    },
    signInLink: {
        color: '#2D8B85',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default SignUpScreen;