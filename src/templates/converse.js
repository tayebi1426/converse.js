import { html } from 'lit-html';
import '../components/font-awesome.js';


export default () => html`
    <converse-chats></converse-chats>
    <div id="converse-modals" class="modals"></div>
    <converse-fontawesome></converse-fontawesome>
`;
