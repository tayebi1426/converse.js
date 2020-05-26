import { html } from 'lit-html';

export default (o) => html`
    <div class="chatroom-form-container muc-nickname-form">
        <form class="converse-form chatroom-form converse-centered-form">
            <fieldset class="form-group">
                <label>${o.heading}</label>
                <input type="text" required="required" name="nick" value="${o.label_nickname}" class="form-control ${o.error_class}" placeholder="${o.label_nickname}"/>
            </fieldset>
            <fieldset class="form-group">
                <input type="submit" class="btn btn-primary" name="join" value="${o.label_join}"/>
            </fieldset>
        </form>
    </div>
`;
