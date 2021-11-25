import { useState, useEffect } from 'react'
import FootprintCard from './components/FootprintCard'
import type { GeneralAssetWithTags } from './common/types'
import config from './common/config'
import Button from './components/Button'
import { COLORS } from './common/variables'
import { Typography } from '@mui/material'
import RSS3 from './common/rss3'
import { makeStyles } from '@masknet/theme'
import formatter from './common/address'
import { CircularProgress } from '@mui/material'
import utils from './common/utils'

const useStyles = makeStyles()((theme) => ({
    msg: {
        color: theme.palette.mode === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)',
    },
    primaryText: {
        color: theme.palette.primary.main,
    },
}))
interface FootprintPageProps {
    username: string
    address: string
    isOwnAddress: boolean
}

export function FootprintPage(props: FootprintPageProps) {
    const { username, address, isOwnAddress } = props
    const { classes } = useStyles()

    const [isConnected, setIsConnected] = useState(false)
    const [listedFootprint, setListedFootprint] = useState<GeneralAssetWithTags[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const toSingleFootprint = (platform: string, identity: string, id: string, type: string) => {
        window.open(`https://rss3.bio/${address}/singlefootprint/${platform}/${identity}/${id}/${type}`)
    }

    const loadFootprints = async () => {
        const { listed } = await utils.initAssets('POAP')
        setIsLoading(false)
        setListedFootprint(listed)
    }

    useEffect(() => {
        if (Object.keys(RSS3.getPageOwner()).length !== 0) {
            setIsConnected(true)
        } else {
            setIsConnected(false)
        }
        loadFootprints()
    }, [])

    return (
        <>
            {isLoading ? (
                <div className="flex justify-center items-center">
                    <CircularProgress />
                </div>
            ) : address !== '' ? (
                isConnected ? (
                    <div>
                        <section className="flex flex-row justify-between items-center w-full gap-4">
                            <Typography className={classes.primaryText} variant="subtitle1" color="textPrimary">
                                {formatter(address)}
                            </Typography>
                            {isOwnAddress ? (
                                <Button
                                    isOutlined={true}
                                    color={COLORS.footprint}
                                    text="Edit"
                                    onClick={() => {
                                        window.open(`https://rss3.bio/`)
                                    }}
                                />
                            ) : (
                                ''
                            )}
                        </section>
                        <section className="grid items-center justify-start grid-cols-1 gap-2 py-4">
                            {listedFootprint.map((asset, index) => (
                                <FootprintCard
                                    key={index}
                                    imageUrl={asset.info.image_preview_url || config.undefinedImageAlt}
                                    startDate={asset.info.start_date}
                                    endDate={asset.info.end_date}
                                    city={asset.info.country}
                                    country={asset.info.city}
                                    username={username}
                                    activity={asset.info.title || ''}
                                    clickEvent={() => {
                                        toSingleFootprint(asset.platform, asset.identity, asset.id, asset.type)
                                    }}
                                />
                            ))}
                        </section>
                    </div>
                ) : (
                    <div className="text-center my-8">
                        <Typography className={classes.msg} variant="body1">
                            {isOwnAddress
                                ? 'Please connect your RSS3 profile'
                                : 'This user has not connect with RSS3 yet'}
                        </Typography>
                    </div>
                )
            ) : (
                <div className="text-center my-8">
                    <Typography className={classes.msg} variant="body1">
                        {isOwnAddress
                            ? 'Please connect an Ethereum compatible wallet'
                            : 'This user has not connect any Ethereum compatible wallet'}
                    </Typography>
                </div>
            )}
        </>
    )
}
