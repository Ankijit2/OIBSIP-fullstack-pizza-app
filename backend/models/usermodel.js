import mongoose,{Schema} from "mongoose";
import  Jwt  from "jsonwebtoken";
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {
        fullname:{
            type:String,
            required:true,

        },
        username:{
            type:String,
            required: [true,"Username is required"], 
            unique: [true,"Username already exists"],
            trim:true,
            lowercase: true,
            index: true
        },
        email:{
            type:String,
            required: [true,"Email is required"], 
            unique: [true,"Email already exists"],
            trim:true,
            lowercase:true,
            index:true
        },
       
        password:{
            type:String,
            required:[true,"Password is required"]
        },
        refreshtoken:{
            type:String
        },
        verified:{
            type:Boolean,
            default:false
        }




    }
)

userSchema.pre('save',async function(next){
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password,10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password)
}


userSchema.methods.generateAccessToken = function(){
    return Jwt.sign({
        id:this._id,
        email:this.email,
        username:this.username,
        fullname:this.fullname
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return Jwt.sign({
        id:this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
    )
}

export const User = mongoose.model('User',userSchema)