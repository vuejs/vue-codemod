<template>
  <div
    :style="{ color: props.color, background: props.background }"
    class="actionable-notification"
  >
    <div class="notification-icon">
      <div
        v-if="counter"
        class="counter"
      >
        {{ counter }}
      </div>
      <span :class="[props.notificationIcon]" />
    </div>
    <div class="notification">
      <v-clamp
        autoresize
        :max-lines="3"
      >
        {{ message }}
      </v-clamp>
    </div>
    <div class="action-icon">
      <span
        v-tooltip="actionTooltip"
        :class="[props.actionIcon]"
        @click="$emit('click')"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { organizationServices } from '@/services/organizationServices';
import { usersServices } from '@/services/usersServices';
import { mixins } from '@/utils/mixins';
import { getOrganization } from '@/utils/utils';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

@Component({
  mixins: [mixins],
})
export default class PasswordInput extends Vue {
  @Prop()
  private contextEmail!: Dadsfasd | string | undefined | null;
  
  @Prop({ default: false })
  private disabled!: boolean;

  @Prop()
  private initialValue!: string;

  @Prop({ default: '' })
  private label!: MyModel;

  @Prop()
  private theme!: string | undefined;

  @Prop()
  private ignIcon!: string | undefined;

  @Prop()
  private autocomplete!: string | undefined;

  private policyConfig: any = {};

  private showTooltip = false;

  private passwordValue = '';

  private validated = false;

  private waitedForInitialFocus = false;

  private errors = [];

  private passwordVisible = false;

  validateEmail: any; // present in mixin, avoid ts error

  /* always show keys */
  private tooltipKeys = [];

  @Watch('contextEmail')
  emailUpdated(newEmail) {
    // please note that validateEmail mixin returns falsy when email is valid
    if (this.passwordValue && !this.validateEmail(newEmail)) {
      this.checkPasswordPolicy();
    }
  }

  @Watch('passwordValue')
  passwordValueUpdated(newPassword) {
    this.$emit('input', newPassword);

  }

  get validPassword() {
    return this.passwordValue && this.validated && !this.errors.length;
  }

  get eyeToggleClass() {
    return `icon-${this.passwordVisible ? 'smallfont_openeye' : 'smallfont_closedeye'}`;
  }

  created() {
    this.passwordValue = this.initialValue;
  }

  get organizationId() {
    const organization = getOrganization();

    return organization && organization.id;
  }

  get passwordErrorString() {
    if (!this.passwordValue) return '';

    const translatedErrorRules = this.errors.map(key => {
      return this.policyConfig[key]
        ? this.ignI18n.t(`passwordPolicy.${key}`, this.policyConfig[key])
        : key;
    });

    return translatedErrorRules.join(', ');
  }

  get hintString() {
    return this.validPassword && this.ignI18n.t('passwordIsSecure');
  }

  async mounted() {
    let policy = {
      configuration: {},
    };

    try {
      policy = await organizationServices.getPasswordPolicy();
    } catch (e) {
      this.tooltipKeys = []; // clear default keys. Don't show tooltip without the config.
      return;
    }

    this.policyConfig = policy && policy.configuration;

    // normalize tooltip info
    this.buildTooltipInfo();
  }

  buildTooltipInfo() {
    const alwaysOnKeys = [];

    const showBasedOnFlag = [
      'LENGTH_RANGE',
      'UPPERCASE',
      'LOWERCASE',
      'NUMBERS',
      'SPECIAL_CHARACTER',
      'CONTEXT_WORD',
      'REPETITIVE_CHARACTER',
      'SEQUENTIAL_CHARACTER',
    ];

    const numberStrings = [
      'UPPERCASE',
      'LOWERCASE',
      'NUMBERS',
      'SPECIAL_CHARACTER',
    ];

    numberStrings.forEach((key: any) => {
      if (!this.policyConfig[key]) {
        return;
      }
      this.policyConfig[key][`${key}_MIN_AS_WORD`] = this.ignI18n.t(`numberStrings.${this.policyConfig[key][`${key}_MIN`]}`);
    });

    this.tooltipKeys = [...alwaysOnKeys];
    showBasedOnFlag.forEach(((key: string) => {
      // check the policy to see what other rules are configured for this organization
      if (Object.keys(this.policyConfig).includes(key)) {
        this.tooltipKeys.push(key);
      }
    }));

    if (this.policyConfig['BLOCK_LIST']) {
      this.policyConfig['BLOCK_LIST']['BLOCK_LIST_DETAILS'] = this.policyConfig['BLOCK_LIST']['BLOCK_LIST_WORDS'].join(', ');
    }
  }

  handleFocus() {
    this.buildTooltipInfo();

    if (!this.waitedForInitialFocus) {
      this.waitedForInitialFocus = true;
      this.checkPasswordPolicy();
    }
    this.showTooltip = true;

    this.$emit('focus');
  }

  handleBlur() {
    this.checkPasswordPolicy();
    this.showTooltip = false;

    // attach "is valid" flag to blur event
    this.$emit('blur', !this.errors.length);
  }

  async checkPasswordPolicy() {
    if (!this.waitedForInitialFocus || this.passwordValue === this.initialValue) {
      return;
    }

    try {
      // make sure we do not send email: null to BE because it breaks.
      const email = this.contextEmail || '';

      let validation = await usersServices.validatePasswordPolicy({
        email: !this.validateEmail(email) ? email : '', // make sure email sent is valid. otherwise BE breaks.
        password: this.passwordValue || '',
        organizationId: this.organizationId,
      });

      this.errors = validation || [];
    } catch (e) {
      this.errors = [
        this.ignI18n.t('passwordValidationFailDueToServer'),
      ];
      this.tooltipKeys = [];
    }

    this.validated = true;

    if (!this.errors.length) {
      this.$emit('validation', true);
    } else {
      this.$emit('validation', false);
    }
  }
}
</script>

<style
  scoped
  lang="less"
>
@import '../../../../public/less/style';

.actionable-notification {
  width:         100%;
  height:        100%;
  border-radius: 3px;
  display:       flex;
  padding:       16px 8px;
  font-weight:   500;


  .notification-icon, .action-icon {
    display:     flex;
    align-items: center;
    width:       45px;
  }

  .notification-icon {
    font-size:       30px;
    justify-content: flex-start;
    position:        relative;

    .counter {
      position:         absolute;
      background-color: @error;
      color:            #fff;
      border-radius:    50%;
      font-size:        10px;
      width:            20px;
      height:           20px;
      display:          flex;
      justify-content:  center;
      align-items:      center;
      top:              5px;
      left:             -2px;
    }
  }

  .action-icon {
    font-size:       20px;
    justify-content: flex-end;

    span {
      cursor: pointer;
    }
  }

  .notification {
    width:         calc(100% - 90px);
    font-size:     12px;
    overflow:      hidden;
    text-overflow: ellipsis;
    align-self:    center;
  }
}

</style>
