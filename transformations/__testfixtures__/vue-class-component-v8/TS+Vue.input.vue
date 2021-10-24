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
import {
  FINDINGS_WARNING_MESSAGES_DISPLAY_KEY,
  FINDINGS_WARNING_TYPE,
  FINDINGS_WARNING_TYPE_TEXT,
  QUEUE_CHANNELS,
} from '@/utils/consts';
import { formatLocalized } from '@/utils/utils';
import { Component, Vue } from 'vue-property-decorator';
import { Publisher } from 'vue-q';
import { namespace } from 'vuex-class';

const patientDetailsModule = namespace('patientDetailsModule');

@Component({
  components: {
    IgrButton: () => import('igentify-ui-core/lib/rainbow/components/IgrButton/IgrButton.vue'),
    IgcIcon: () => import('igentify-ui-core/lib/shared/components/IgcIcon/IgcIcon.vue'),
  },
})
export default class CardNotifications extends Vue {
  @patientDetailsModule.State('warnings') warnings!: any[];

  menuOpen = false;

  get buttonStyle() {
    return {
      ...(this.menuOpen && this.warnings.length ? {
        '--button-background-color': '#2196f3',
        '--button-text-color': '#fff',
      } : {
        '--button-background-color': '#fff',
        '--button-text-color': '#2196f3',
      }),
      '--button-label-font-size': '12px',
      '--button-min-width': '96px',
      '--button-tooltip-main-color': '#2196f3',
      '--button-tooltip-border-color': '#2196f3',
    };
  }

  get FINDINGS_WARNING_TYPE() {
    return FINDINGS_WARNING_TYPE;
  }

  getWarningIconName(type) {
    switch (type) {
      case FINDINGS_WARNING_TYPE.MOSAIC:
        return 'topic_icons_warning';
      case FINDINGS_WARNING_TYPE.SMN_REPORT_CARRIER:
        return 'topic-icons_sample';
      case FINDINGS_WARNING_TYPE.QUESTIONNAIRE_ALERT:
      case FINDINGS_WARNING_TYPE.QUESTIONNAIRE_COMMENT:
        return 'smallfont_flag';
      case FINDINGS_WARNING_TYPE.MISSING_COUPLE_PARTNER:
      case FINDINGS_WARNING_TYPE.PAIR_COUPLE:
      case FINDINGS_WARNING_TYPE.UNPAIR_COUPLE:
        return 'fontready_couple';
      case FINDINGS_WARNING_TYPE.ADDITIONAL_TESTS_ALERT:
        return 'smallfont_massagge';
      default:
        return 'topic-icons_sample';
    }
  }

  getWarningIconStyle(type) {
    let color = '#ffffff';
    let backgroundColor = '#511010';
    let fontSize = '14px';

    switch (type) {
      case FINDINGS_WARNING_TYPE.SMN_REPORT_CARRIER:
        color = 'var(--neutral--hugo)';
        backgroundColor = '#F5CE21';
        break;
      case FINDINGS_WARNING_TYPE.MISSING_COUPLE_PARTNER:
        color = '#9C27B0';
        backgroundColor = '#fff';
        fontSize = '23px';
        break;
      case FINDINGS_WARNING_TYPE.QUESTIONNAIRE_ALERT:
      case FINDINGS_WARNING_TYPE.QUESTIONNAIRE_COMMENT:
        backgroundColor = '#9C27B0';
        break;
      case FINDINGS_WARNING_TYPE.PAIR_COUPLE:
      case FINDINGS_WARNING_TYPE.UNPAIR_COUPLE:
        color = 'var(--secondary--eric)';
        backgroundColor = '#ffffff';
        fontSize = '23px';
        break;
      case FINDINGS_WARNING_TYPE.ADDITIONAL_TESTS_ALERT:
        color = '#9C27B0';
        backgroundColor = '#ffffff';
        fontSize = '23px';
        break;
    }

    return {
      color,
      backgroundColor,
      fontSize,
    };
  }

  getWarningLabelText(type) {
    return FINDINGS_WARNING_TYPE_TEXT[FINDINGS_WARNING_TYPE[type]];
  }

  getWarningDescription(errorWarning) {
    if (errorWarning.warningType === FINDINGS_WARNING_TYPE.ADDITIONAL_TESTS_ALERT) {
      return errorWarning.attributes.text;
    }

    if (errorWarning.attributes.reason) {
      return `Reason: ${errorWarning?.attributes?.reason}`;
    }

    return errorWarning?.attributes?.text
      || this.ignI18n.t(FINDINGS_WARNING_MESSAGES_DISPLAY_KEY[errorWarning.warningType], errorWarning.attributes);
  }

  getIsMissingCouplePartnerWarning(type) {
    return type === FINDINGS_WARNING_TYPE.MISSING_COUPLE_PARTNER;
  }

  getIsCoupleAlert(warning){
    return [
      FINDINGS_WARNING_TYPE.PAIR_COUPLE,
      FINDINGS_WARNING_TYPE.UNPAIR_COUPLE,
    ].includes(warning.warningType);
  }

  getFormattedDate(date) {
    return formatLocalized(date, 'YYYY-MM-DD');
  }

  getAdditionalTestsItems(warning) {
    return warning.attributes.items ? JSON.parse(warning.attributes.items) : [];
  }

  @Publisher(QUEUE_CHANNELS.WARNING_CHANNEL)
  onWarningClick(queue, warning) {
    queue.send(warning);
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
