import { Box, TextField, Typography } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { useState, useCallback } from 'react'
import type { ERC20TokenDetailed } from '@masknet/web3-shared-evm'
import { CheckStateType, useCheckCallback } from '../hooks/useCheckCallback'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { useI18N } from '../../../utils'
import { Trans } from 'react-i18next'

const useStyles = makeStyles()((theme) => ({
    root: {
        padding: theme.spacing(2.5),
        marginBottom: theme.spacing(1.5),
        fontSize: 13,
        color: '#fff',
    },
    textfield: {
        flex: 1,
        height: 56,
        color: '#fff !important',
        '& fieldset, & > div, & > div:hover, & > div:active': {
            color: '#fff !important',
            borderColor: '#F3F3F4 !important',
        },
        [theme.breakpoints.down('sm')]: {
            width: '100%',
        },
    },
    helperText: {
        color: '#fff',
        fontSize: 12,
    },
    buttonContainer: {
        marginLeft: theme.spacing(2.5),
        padding: theme.spacing(0.5, 0),
        [theme.breakpoints.down('sm')]: {
            marginLeft: 0,
            marginTop: theme.spacing(1),
            width: '100%',
        },
    },
    button: {
        //TODO: https://github.com/mui-org/material-ui/issues/25011
        '&[disabled]': {
            color: '#fff',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            opacity: 0.5,
        },
        [theme.breakpoints.down('sm')]: {
            width: '100%',
        },
    },
    controller: {
        display: 'flex',
        alignItems: 'center',
        marginTop: theme.spacing(1.2),
        [theme.breakpoints.down('sm')]: {
            flexDirection: 'column',
        },
    },
}))

export interface AirdropCheckCardProps extends withClasses<never> {
    token?: ERC20TokenDetailed
}

export function AirdropCheckCard(props: AirdropCheckCardProps) {
    const { token } = props
    const classes = useStylesExtends(useStyles(), props)
    const { t } = useI18N()

    //#region check callback
    const [checkAddress, setCheckAddress] = useState('')
    const [checkState, checkCallback, resetCheckCallback] = useCheckCallback()
    const onCheckButtonClick = useCallback(() => {
        if (checkState.type === CheckStateType.PENDING) return
        checkCallback(checkAddress, false)
    }, [checkState, checkAddress, checkCallback])
    //#endregion

    if (!token) return null

    return (
        <Box className={classes.root}>
            <Typography>{t('popups_check_address')}</Typography>
            <Box className={classes.controller}>
                <TextField
                    classes={{ root: classes.textfield }}
                    value={checkAddress}
                    variant="outlined"
                    error={checkState.type === CheckStateType.FAILED}
                    helperText={
                        <Typography
                            className={classes.helperText}
                            component="span"
                            style={{
                                color: (() => {
                                    switch (checkState.type) {
                                        case CheckStateType.YEP:
                                            return '#77E0B5'
                                        case CheckStateType.PENDING:
                                            return '#ffffff'
                                        default:
                                            return '#FF5555'
                                    }
                                })(),
                            }}>
                            {(() => {
                                switch (checkState.type) {
                                    case CheckStateType.YEP:
                                        return (
                                            <Trans
                                                i18nKey="plugin_airdrop_claim_amount"
                                                values={{ amount: checkState.packet.amount, symbol: token.symbol }}
                                            />
                                        )
                                    case CheckStateType.NOPE:
                                        return t('plugin_airdrop_no_reward')
                                    case CheckStateType.CLAIMED:
                                        return t('plugin_airdrop_claimed')
                                    case CheckStateType.FAILED:
                                        return checkState.error.message ?? t('plugin_airdrop_failed')
                                    case CheckStateType.PENDING:
                                        return t('plugin_airdrop_checking')
                                    default:
                                        return ''
                                }
                            })()}
                        </Typography>
                    }
                    onChange={(e) => setCheckAddress(e.target.value)}
                    placeholder={t('plugin_airdrop_placeholder')}
                    inputProps={{
                        maxLength: 42,
                    }}
                />
                <Box className={classes.buttonContainer}>
                    <ActionButton
                        className={classes.button}
                        variant="contained"
                        loading={checkState.type === CheckStateType.PENDING}
                        disabled={!checkAddress}
                        onClick={onCheckButtonClick}>
                        {t('check')}
                    </ActionButton>
                </Box>
            </Box>
        </Box>
    )
}
